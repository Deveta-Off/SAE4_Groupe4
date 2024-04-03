import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  const {saleId} = req.body;


  await pool.query(
    "DELETE FROM transactioncontent WHERE transaction_id = ?",
    [saleId],
    (err) => {
      if (err) {
        console.error("Impossible de supprimer le produit :", err);
        res.status(500).json({ error: "Impossible de supprimer le produit" });
        return;
      }
    }
  );

  
  await pool.query(
    "DELETE FROM transaction WHERE transaction_id = ?",
    [saleId],
    (err) => {
      if (err) {
        console.error("Impossible de supprimer le produit :", err);
        res.status(500).json({ error: "Impossible de supprimer le produit" });
        return;
      }
    }
  );

  

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  res.status(200).json({success: true});
});

export default router;
