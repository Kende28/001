import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.use(express.json());

const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "energiaital",
});

app.post("/energy-drinks", async (req, res) => {
  const { name, brand, caffeine, sugar_free } = req.body;
  let arrayError = [];
  if (!name) {
    arrayError.push({ error: "A 'name' mező megadása kötelező." });
  }
  if (!brand) {
    arrayError.push({ error: "A 'brand' mező megadás kötelező." });
  }
  if (!caffeine) {
    arrayError.push({ error: "A 'caffeine' mező megadás kötelező." });
  }
  if (!sugar_free) {
    arrayError.push({ error: "A 'sugar_free' mező megadás kötelező." });
  }
  if (arrayError.length != 0) {
    res.status(400).json({ arrayError });
  }

  try {
    const [result] = await connection.query(
      `INSERT INTO energy_drinks (name, brand, caffein, sugar_free, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, brand, caffeine, sugar_free ?? false]
    );
    res.send({ message: "Energiaital sikeresen hozzáadva" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Szerverhiba történt az energiaital mentés közben" });
  }
});

app.get("/energy-drinks", async (req, res) => {
  try {
    const [result, fields] = await connection.query(
      "SELECT * FROM energy_drinks"
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Szerverhiba történt az energiaitalok lekérdetése közben",
    });
  }
});

app.delete("/energy-drinks/:id", async (req, res) => {
  const energyDrinkId = req.params.id;
  try {
    const [result] = await connection.query(
      "DELETE FROM users WHERE id = ?"[energyDrinkId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Energiaital nem található" });
    }

    res.status(200).json({ message: "Energiaital sikeresen törölve" });
  } catch (error) {
    res.status(500).json({ error: "Törlési hiba" });
  }
});

app.put("/energy-drinks/:id", async (req, res) => {
  const energyDrinkId = req.params.id;
  const { name, brand, caffein, sugar_free } = req.body;

  if (!name || !brand || !caffein) {
    return res.status(400).json({ error: "Hiányzó vagy hibás mezők" });
  }

  try {
    const [result] = await connection.query(
      `UPDATE energy_drinks
        SET name = ?
        brand = ?
        caffein = ?
        sugar_free = ?
        updated_at = ?`
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Energiaital nem található" });
    }

    res.status(200).json({ message: "Energiaital sikeresen frissítve" });
  } catch (error) {
    console.error("hiba: ", error);
    res
      .status(500)
      .json({ error: "Szerverhiba történt az energiaital módosítás közben" });
  }
});
