import express from "express";
const router = express.Router();
import { pool } from "../../server.js";

router.post("", async (req, res) => {
  const { id } = req.body;

  if (!req.session.isLoggedIn || req.session.category !== "admin") {
    res.status(403).json({ error: "Accès refusé" });
    return;
  }

  await pool.query(
    "DELETE FROM product_color WHERE product_id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Impossible de supprimer le produit :", err);
        res.status(500).json({ error: "Impossible de supprimer le produit" });
        return;
      }
    }
  );

  await pool.query(
    "DELETE FROM product_size WHERE product_id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Impossible de supprimer le produit :", err);
        res.status(500).json({ error: "Impossible de supprimer le produit" });
        return;
      }
    }
  );

  const [transactionIds] = await pool.query(
    "SELECT transaction_id FROM transactioncontent WHERE product_id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Impossible de récupérer la transaction :", err);
        res
          .status(500)
          .json({ error: "Impossible de récupérer la transaction" });
        return;
      }
    }
  );

  await pool.query(
    "DELETE FROM transactioncontent WHERE product_id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Impossible de supprimer le produit :", err);
        res.status(500).json({ error: "Impossible de supprimer le produit" });
        return;
      }
    }
  );

  for (let i = 0; i < transactionIds.length; i++) {
    await pool.query(
      "DELETE FROM transaction WHERE transaction_id = ?",
      [transactionIds[i].transaction_id],
      (err) => {
        if (err) {
          console.error("Impossible de supprimer le produit :", err);
          res.status(500).json({ error: "Impossible de supprimer le produit" });
          return;
        }
      }
    );
  }

  await pool.query("DELETE FROM product WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Impossible de supprimer le produit :", err);
      res.status(500).json({ error: "Impossible de supprimer le produit" });
      return;
    }
  });

  res.status(200).json({ success: true });
});

export default router;
