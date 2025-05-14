const db = require('../config/connectDB');
const fs = require("fs");
const path = require("path");

exports.createResort = (req, res) => {
  const { name, location, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const rooms = JSON.parse(req.body.rooms);
  const amenities = JSON.parse(req.body.amenities || "[]");

  if (!name || !location || !description || !image || rooms.length === 0) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const resortQuery = 'INSERT INTO resorts (name, location, description, image) VALUES (?, ?, ?, ?)';
  db.query(resortQuery, [name, location, description, image], (err, result) => {
    if (err) {
      console.error('Error inserting resort:', err);
      return res.status(500).json({ message: 'Server error while inserting resort.' });
    }

    const resortId = result.insertId;

    const roomQuery = 'INSERT INTO rooms (resort_id, name, price) VALUES ?';
    const roomValues = rooms.map(room => [resortId, room.name, room.price]);

    db.query(roomQuery, [roomValues], (err2) => {
      if (err2) {
        console.error('Error inserting rooms:', err2);
        return res.status(500).json({ message: 'Server error while inserting rooms.' });
      }

      if (amenities.length > 0) {
        const amenityQuery = 'INSERT INTO resort_amenities (resort_id, amenity) VALUES ?';
        const amenityValues = amenities.map(amenity => [resortId, amenity]);

        db.query(amenityQuery, [amenityValues], (err3) => {
          if (err3) {
            console.error('Error inserting amenities:', err3);
            return res.status(500).json({ message: 'Server error while inserting amenities.' });
          }

          return res.status(201).json({ message: 'Resort created successfully with amenities!' });
        });
      } else {
        return res.status(201).json({ message: 'Resort created successfully!' });
      }
    });
  });
};


exports.getTotalResorts = (req, res) => {
  const query = 'SELECT COUNT(*) AS totalResorts FROM resorts';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total resorts:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
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

exports.getResortById = (req, res) => {
  const { id } = req.params;

  const resortQuery = "SELECT * FROM resorts WHERE id = ?";
  const roomsQuery = "SELECT name, price FROM rooms WHERE resort_id = ?";
  const amenitiesQuery = "SELECT amenity FROM resort_amenities WHERE resort_id = ?";

  db.query(resortQuery, [id], (err, resortResults) => {
    if (err || resortResults.length === 0) {
      return res.status(404).json({ message: "Resort not found" });
    }

    const resort = resortResults[0];

    db.query(roomsQuery, [id], (err, roomResults) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching rooms" });
      }

      db.query(amenitiesQuery, [id], (err, amenityResults) => {
        if (err) {
          return res.status(500).json({ message: "Error fetching amenities" });
        }

        resort.rooms = roomResults;
        resort.amenities = amenityResults.map(a => a.amenity);

        res.json(resort);
      });
    });
  });
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
  const image = req.file ? req.file.filename : null;

  let rooms = [];
  let amenities = [];

  try {
    rooms = JSON.parse(req.body.rooms || "[]");
    amenities = JSON.parse(req.body.amenities || "[]");
  } catch (err) {
    return res.status(400).json({ message: "Invalid JSON for rooms or amenities." });
  }

  if (!name || !location || !description || rooms.length === 0) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  const updateFields = image
    ? [name, location, description, image, id]
    : [name, location, description, id];

  const updateQuery = image
    ? `UPDATE resorts SET name = ?, location = ?, description = ?, image = ? WHERE id = ?`
    : `UPDATE resorts SET name = ?, location = ?, description = ? WHERE id = ?`;

  db.query(updateQuery, updateFields, (err) => {
    if (err) {
      console.error("Error updating resort:", err);
      return res.status(500).json({ message: "Error updating resort." });
    }

    db.query(`DELETE FROM rooms WHERE resort_id = ?`, [id], (err2) => {
      if (err2) {
        console.error("Error deleting old rooms:", err2);
        return res.status(500).json({ message: "Error updating rooms." });
      }

      const roomValues = rooms.map((room) => [id, room.name, room.price]);
      db.query(
        `INSERT INTO rooms (resort_id, name, price) VALUES ?`,
        [roomValues],
        (err3) => {
          if (err3) {
            console.error("Error inserting new rooms:", err3);
            return res.status(500).json({ message: "Error inserting updated rooms." });
          }

          db.query(`DELETE FROM resort_amenities WHERE resort_id = ?`, [id], (err4) => {
            if (err4) {
              console.error("Error deleting old amenities:", err4);
              return res.status(500).json({ message: "Error updating amenities." });
            }

            if (amenities.length > 0) {
              const amenityValues = amenities.map((item) => [id, item]);
              db.query(
                `INSERT INTO resort_amenities (resort_id, amenity) VALUES ?`,
                [amenityValues],
                (err5) => {
                  if (err5) {
                    console.error("Error inserting new amenities:", err5);
                    return res.status(500).json({ message: "Error inserting updated amenities." });
                  }

                  return res.status(200).json({ message: "Resort updated successfully!" });
                }
              );
            } else {
              return res.status(200).json({ message: "Resort updated successfully!" });
            }
          });
        }
      );
    });
  });
};

exports.getResortByLocation = (req, res) => {
  const location = req.params.location;
  const query = "SELECT * FROM resorts WHERE location = ? ORDER BY created_at DESC";

  db.query(query, [location], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });

};
