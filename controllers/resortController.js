const db = require("../config/connectDB");
const { buildValuesClause } = require("../utils/buildValuesClause");

exports.createResort = async (req, res) => {
  const { name, location, description } = req.body;

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

  if (!name || !location || !description || rooms.length === 0) {
    return res
      .status(400)
      .json({ message: "All fields and at least one room are required." });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required." });
  }

  const imageUrls = req.files.map((file) => file.path);

  try {
    const resortResult = await db.query(
      "INSERT INTO resorts (name, location, description) VALUES ($1, $2, $3) RETURNING id",
      [name, location, description],
    );
    const resortId = resortResult[0].id;

    // Insert gallery images
    const imageValues = imageUrls.map((url) => [resortId, url]);
    const imageClause = buildValuesClause(imageValues);
    await db.query(
      `INSERT INTO resort_images (resort_id, image_url) VALUES ${imageClause.placeholders}`,
      imageClause.values,
    );

    // Also set the legacy cover thumbnail (used by listing/search cards)
    // to the first uploaded image, so it isn't blank until someone edits.
    db.query("UPDATE resorts SET image = $1 WHERE id = $2", [
      imageUrls[0],
      resortId,
    ]).catch((errCover) =>
      console.error("Error setting cover image:", errCover),
    );

    // Insert rooms
    const roomValues = rooms.map((room) => [resortId, room.name, room.price]);
    const roomClause = buildValuesClause(roomValues);
    await db.query(
      `INSERT INTO rooms (resort_id, name, price) VALUES ${roomClause.placeholders}`,
      roomClause.values,
    );

    // Insert amenities, if any
    if (amenities.length > 0) {
      const amenityValues = amenities.map((amenity) => [resortId, amenity]);
      const amenityClause = buildValuesClause(amenityValues);
      await db.query(
        `INSERT INTO resort_amenities (resort_id, amenity) VALUES ${amenityClause.placeholders}`,
        amenityClause.values,
      );

      return res.status(201).json({
        message:
          "Resort created successfully with images, rooms, and amenities!",
      });
    }

    return res.status(201).json({
      message: "Resort created successfully with images and rooms!",
    });
  } catch (err) {
    console.error("Error creating resort:", err);
    return res
      .status(500)
      .json({ message: "Server error while creating resort." });
  }
};

exports.getTotalResorts = async (req, res) => {
  try {
    const results = await db.query(
      'SELECT COUNT(*) AS "totalResorts" FROM resorts',
    );
    res.json({ totalResorts: Number(results[0].totalResorts) });
  } catch (err) {
    console.error("Error fetching total resorts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllResorts = async (req, res) => {
  try {
    const results = await db.query(
      "SELECT * FROM resorts ORDER BY created_at DESC",
    );
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching resorts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getResortById = async (req, res) => {
  const { id } = req.params;

  try {
    const resortResults = await db.query(
      "SELECT * FROM resorts WHERE id = $1",
      [id],
    );
    if (resortResults.length === 0) {
      return res.status(404).json({ message: "Resort not found" });
    }

    const resort = resortResults[0];

    const roomResults = await db.query(
      "SELECT id, name, price FROM rooms WHERE resort_id = $1",
      [id],
    );
    const amenityResults = await db.query(
      "SELECT amenity FROM resort_amenities WHERE resort_id = $1",
      [id],
    );
    const imageResults = await db.query(
      "SELECT id, image_url FROM resort_images WHERE resort_id = $1",
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
    await db.query("DELETE FROM resort_amenities WHERE resort_id = $1", [id]);
    await db.query("DELETE FROM rooms WHERE resort_id = $1", [id]);
    await db.query("DELETE FROM resort_images WHERE resort_id = $1", [id]);
    await db.query("DELETE FROM resorts WHERE id = $1", [id]);

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
      `UPDATE resorts SET name = $1, location = $2, description = $3, image = $4 WHERE id = $5`,
      [name, location, description, coverImage, id],
    );

    // Replace the gallery with exactly what the admin submitted (kept + new)
    await db.query(`DELETE FROM resort_images WHERE resort_id = $1`, [id]);
    const imageValues = finalImages.map((url) => [id, url]);
    const imageClause = buildValuesClause(imageValues);
    await db.query(
      `INSERT INTO resort_images (resort_id, image_url) VALUES ${imageClause.placeholders}`,
      imageClause.values,
    );

    await db.query(`DELETE FROM rooms WHERE resort_id = $1`, [id]);
    if (rooms.length > 0) {
      const roomValues = rooms.map((room) => [id, room.name, room.price]);
      const roomClause = buildValuesClause(roomValues);
      await db.query(
        `INSERT INTO rooms (resort_id, name, price) VALUES ${roomClause.placeholders}`,
        roomClause.values,
      );
    }

    await db.query(`DELETE FROM resort_amenities WHERE resort_id = $1`, [id]);
    if (amenities.length > 0) {
      const amenityValues = amenities.map((item) => [id, item]);
      const amenityClause = buildValuesClause(amenityValues);
      await db.query(
        `INSERT INTO resort_amenities (resort_id, amenity) VALUES ${amenityClause.placeholders}`,
        amenityClause.values,
      );
    }

    return res.status(200).json({ message: "Resort updated successfully!" });
  } catch (err) {
    console.error("Error updating resort:", err);
    return res.status(500).json({ message: "Error updating resort." });
  }
};

exports.getResortByLocation = async (req, res) => {
  const location = req.params.location;

  try {
    const results = await db.query(
      "SELECT * FROM resorts WHERE location = $1 ORDER BY created_at DESC",
      [location],
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching resorts by location:", err);
    res.status(500).json({ error: "Database error" });
  }
};
