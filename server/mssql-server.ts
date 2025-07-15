import express from "express";
import cors from "cors";
import sql from "mssql";

// 👇 Edit your MSSQL credentials here
const config = {
  user: "priyaJ",           // 👈 your MSSQL username
  password: "1234",       // 👈 your MSSQL password
  server: "MadhupriyajWS",             // or use your host/IP
  database: "userInsightsDB",      // 👈 your DB name
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const app = express();
const PORT = 5050; // ✅ different port than main app

app.use(cors());
app.use(express.json());

// ✅ Connect to MSSQL once
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// ✅ GET all jobseekers
app.get("/jobseekers", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query("SELECT * FROM jobseekers");
    res.json(result.recordset); // ✅ send jobseeker array
  } catch (err) {
    console.error("MSSQL Fetch Error:", err);
    res.status(500).json({ message: "Error fetching jobseekers" });
  }
});

// ✅ Resume download route (optional)
app.get("/jobseekers/:id/resume", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("id", id)
      .query("SELECT resume_file_path, resume_file_name FROM jobseekers WHERE id = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Resume file not found" });
    }

    const { resume_file_path, resume_file_name } = result.recordset[0];
    res.download(resume_file_path, resume_file_name);
  } catch (err) {
    console.error("Resume Error:", err);
    res.status(500).json({ message: "Failed to download resume" });
  }
});

// ✅ Start new express server
app.listen(PORT, () => {
  console.log(`MSSQL Server running at http://localhost:${PORT}`);
});
