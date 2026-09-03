const db = require("../config/connectDB");
const fs = require("fs");
const path = require("path");

exports.createResort = (req, res) => {
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);

  const { name, location, description } = req.body;

  // Parse rooms and amenities from JSON strings
  let rooms = [];
  let amenities = [];
  try {
    rooms = JSON.parse(req.body.rooms);
    amenities = JSON.parse(req.body.amenities || "[]");
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid JSON format for rooms or amenities." });
  }

  // Validate required fields
  if (!name || !location || !description || rooms.length === 0) {
    return res
      .status(400)
      .json({ message: "All fields and at least one room are required." });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required." });
  }

  // Map Cloudinary URLs from uploaded files
  const imageUrls = req.files.map((file) => file.path);

  // Insert resort into `resorts` table
  const resortQuery =
    "INSERT INTO resorts (name, location, description) VALUES (?, ?, ?)";
  db.query(resortQuery, [name, location, description], (err, result) => {
    if (err) {
      console.error("Error inserting resort:", err);
      return res
        .status(500)
        .json({ message: "Server error while inserting resort." });
    }

    const resortId = result.insertId;

    // Insert multiple images into `resort_images`
    const imageQuery =
      "INSERT INTO resort_images (resort_id, image_url) VALUES ?";
    const imageValues = imageUrls.map((url) => [resortId, url]);

    db.query(imageQuery, [imageValues], (errImg) => {
      if (errImg) {
        console.error("Error inserting images:", errImg);
        return res
          .status(500)
          .json({ message: "Server error while inserting images." });
      }

      // Also set the legacy cover thumbnail (used by listing/search cards)
      // to the first uploaded image, so it isn't blank until someone edits.
      db.query(
        `UPDATE resorts SET image = ? WHERE id = ?`,
        [imageUrls[0], resortId],
        (errCover) => {
          if (errCover) console.error("Error setting cover image:", errCover);
        },
      );

      // Insert rooms into `rooms` table
      const roomQuery = "INSERT INTO rooms (resort_id, name, price) VALUES ?";
      const roomValues = rooms.map((room) => [resortId, room.name, room.price]);

      db.query(roomQuery, [roomValues], (errRooms) => {
        if (errRooms) {
          console.error("Error inserting rooms:", errRooms);
          return res
            .status(500)
            .json({ message: "Server error while inserting rooms." });
        }

        // Insert amenities into `resort_amenities` table if any
        if (amenities.length > 0) {
          const amenityQuery =
            "INSERT INTO resort_amenities (resort_id, amenity) VALUES ?";
          const amenityValues = amenities.map((amenity) => [resortId, amenity]);

          db.query(amenityQuery, [amenityValues], (errAmenity) => {
            if (errAmenity) {
              console.error("Error inserting amenities:", errAmenity);
              return res
                .status(500)
                .json({ message: "Server error while inserting amenities." });
            }

            return res.status(201).json({
              message:
                "Resort created successfully with images, rooms, and amenities!",
            });
          });
        } else {
          return res.status(201).json({
            message: "Resort created successfully with images and rooms!",
          });
        }
      });
    });
  });
};

exports.getTotalResorts = (req, res) => {
  const query = "SELECT COUNT(*) AS totalResorts FROM resorts";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching total resorts:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ totalResorts: results[0].totalResorts });
  });
};

exports.getAllResorts = (req, res) => {
  const query = "SELECT * FROM resorts ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching resorts:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
};

exports.getResortById = async (req, res) => {
  const { id } = req.params;

  try {
    const resortResults = await db.query("SELECT * FROM resorts WHERE id = ?", [
      id,
    ]);
    if (resortResults.length === 0) {
      return res.status(404).json({ message: "Resort not found" });
    }

    const resort = resortResults[0];

    const roomResults = await db.query(
      "SELECT name, price FROM rooms WHERE resort_id = ?",
      [id],
    );
    const amenityResults = await db.query(
      "SELECT amenity FROM resort_amenities WHERE resort_id = ?",
      [id],
    );
    const imageResults = await db.query(
      "SELECT id, image_url FROM resort_images WHERE resort_id = ?",
      [id],
    );

    resort.rooms = roomResults;
    resort.amenities = amenityResults.map((a) => a.amenity);
    resort.images = imageResults; // [{ id, image_url }, ...] - full gallery for the carousel

    res.json(resort);
  } catch (err) {
    console.error("Error fetching resort:", err);
    res.status(500).json({ message: "Error fetching resort details" });
  }
};

exports.deleteResort = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM resort_amenities WHERE resort_id = ?", [id]);

    await db.query("DELETE FROM rooms WHERE resort_id = ?", [id]);

    await db.query("DELETE FROM resorts WHERE id = ?", [id]);

    res.status(200).json({ message: "Resort deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Failed to delete resort" });
  }
};

exports.updateResort = async (req, res) => {
  const { id } = req.params;
  const { name, location, description } = req.body;

  let rooms = [];
  let amenities = [];
  let keepImages = []; // image_urls of existing gallery images the admin did NOT remove

  try {
    rooms = JSON.parse(req.body.rooms || "[]");
    amenities = JSON.parse(req.body.amenities || "[]");
    keepImages = JSON.parse(req.body.existingImages || "[]");
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Invalid JSON for rooms, amenities, or images." });
  }

  // req.files comes from uploadResortImages.array('images', 10) - any newly added photos
  const newImageUrls = req.files ? req.files.map((file) => file.path) : [];
  const finalImages = [...keepImages, ...newImageUrls];

  if (!name || !location || !description || rooms.length === 0) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  if (finalImages.length === 0) {
    return res.status(400).json({ message: "At least one image is required." });
  }

  try {
    const coverImage = finalImages[0]; // legacy single-image column used by listing/search cards

    await db.query(
      `UPDATE resorts SET name = ?, location = ?, description = ?, image = ? WHERE id = ?`,
      [name, location, description, coverImage, id],
    );

    // Replace the gallery with exactly what the admin submitted (kept + new)
    await db.query(`DELETE FROM resort_images WHERE resort_id = ?`, [id]);
    const imageValues = finalImages.map((url) => [id, url]);
    await db.query(
      `INSERT INTO resort_images (resort_id, image_url) VALUES ?`,
      [imageValues],
    );

    await db.query(`DELETE FROM rooms WHERE resort_id = ?`, [id]);
    const roomValues = rooms.map((room) => [id, room.name, room.price]);
    if (roomValues.length > 0) {
      await db.query(`INSERT INTO rooms (resort_id, name, price) VALUES ?`, [
        roomValues,
      ]);
    }

    await db.query(`DELETE FROM resort_amenities WHERE resort_id = ?`, [id]);
    if (amenities.length > 0) {
      const amenityValues = amenities.map((item) => [id, item]);
      await db.query(
        `INSERT INTO resort_amenities (resort_id, amenity) VALUES ?`,
        [amenityValues],
      );
    }

    return res.status(200).json({ message: "Resort updated successfully!" });
  } catch (err) {
    console.error("Error updating resort:", err);
    return res.status(500).json({ message: "Error updating resort." });
  }
};

exports.getResortByLocation = (req, res) => {
  const location = req.params.location;
  const query =
    "SELECT * FROM resorts WHERE location = ? ORDER BY created_at DESC";

  db.query(query, [location], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};
