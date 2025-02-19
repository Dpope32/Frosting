import express from "express";
import multer from "multer";
import fs from "fs-extra";
import path from "path";

const app = express();
const PORT = 3000;

// Configure storage paths
const UPLOAD_DIR = "/mnt/seagate/uploads";
const TEMP_DIR = "/mnt/seagate/temp_uploads";
const THUMB_DIR = "/mnt/seagate/thumbnails";

// Create directories if they don't exist
try {
    fs.ensureDirSync(UPLOAD_DIR);
    fs.ensureDirSync(TEMP_DIR);
    fs.ensureDirSync(THUMB_DIR);
} catch (error) {
    console.error("Failed to create directories:", error);
}

const upload = multer({ dest: TEMP_DIR });

app.use(express.json());

// List files with metadata
app.get("/files/:username", async (req, res) => {
    const username = req.params.username;
    const userDir = path.join(UPLOAD_DIR, username);

    try {
        if (!fs.existsSync(userDir)) {
            return res.json({ files: [] });
        }

        const files = await fs.readdir(userDir);
        const fileInfos = await Promise.all(files.map(async (file) => {
            const filePath = path.join(userDir, file);
            const stats = await fs.stat(filePath);
            return {
                name: file,
                size: stats.size,
                path: `${username}/${file}`,
                timestamp: stats.mtime.toISOString(),
                type: path.extname(file).toLowerCase()
            };
        }));

        res.json({ files: fileInfos });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).send("Failed to fetch files");
    }
});

// Serve files directly
app.get("/thumbnail/:username/:filename", async (req, res) => {
    const { username, filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, username, filename);

    try {
        // If file doesn't exist, return 404
        if (!await fs.pathExists(filePath)) {
            return res.status(404).send('File not found');
        }

        // For now, just serve the original file
        res.sendFile(filePath);

    } catch (error) {
        console.error("File serving error:", error);
        res.status(500).send("Failed to serve file");
    }
});

// Upload file with unique filename
app.post("/upload", upload.single("file"), async (req, res) => {
    const username = req.body.username;
    if (!username) return res.status(400).send("Username is required");

    const userDir = path.join(UPLOAD_DIR, username);

    try {
        await fs.ensureDir(userDir);
        
        // Generate unique filename
        const ext = path.extname(req.file.originalname);
        const name = path.basename(req.file.originalname, ext);
        const uniqueName = `${name}_${Date.now()}${ext}`;
        const newFilePath = path.join(userDir, uniqueName);
        
        await fs.move(req.file.path, newFilePath, { overwrite: true });

        res.send({ 
            message: "Upload successful", 
            filePath: newFilePath,
            filename: uniqueName
        });
    } catch (error) {
        console.error(error);
        // Clean up temp file if it exists
        try {
            if (req.file && req.file.path) {
                await fs.remove(req.file.path);
            }
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }
        res.status(500).send("Server error");
    }
});

app.get("/stats/:username", async (req, res) => {
    const username = req.params.username;
    const userDir = path.join(UPLOAD_DIR, username);

    try {
        if (!fs.existsSync(userDir)) {
            return res.json({ totalSize: 0, fileCount: 0 });
        }

        const files = await fs.readdir(userDir);
        let totalSize = 0;

        for (const file of files) {
            const filePath = path.join(userDir, file);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
        }

        res.json({ totalSize, fileCount: files.length });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).send("Failed to fetch stats");
    }
});

app.get("/health", async (req, res) => {
    try {
        await fs.access(UPLOAD_DIR, fs.constants.W_OK);
        res.json({ status: "healthy", message: "Storage is accessible" });
    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            message: "Storage is not accessible",
            error: error.message
        });
    }
});

app.listen(PORT, () => console.log(`Upload server running on port ${PORT}`));
