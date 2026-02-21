require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from root directory since index.html is there
app.use(express.static(__dirname));

// GET all snippets
app.get('/api/snippets', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching snippets:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST new snippet
app.post('/api/snippets', async (req, res) => {
    try {
        const newSnippet = {
            title: req.body.title,
            language: req.body.language,
            folderId: req.body.folderId || null,
            code: req.body.code
        };
        
        const { data, error } = await supabase
            .from('snippets')
            .insert([newSnippet])
            .select();
            
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error creating snippet:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE snippet
app.delete('/api/snippets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('snippets')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        res.status(200).json({ message: 'Snippet deleted' });
    } catch (error) {
        console.error('Error deleting snippet:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT (Edit) snippet
app.put('/api/snippets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            title: req.body.title,
            language: req.body.language,
            folderId: req.body.folderId || null,
            code: req.body.code
        };
        
        const { data, error } = await supabase
            .from('snippets')
            .update(updateData)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        console.error('Error updating snippet:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET all folders
app.get('/api/folders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST new folder
app.post('/api/folders', async (req, res) => {
    try {
        const newFolder = {
            name: req.body.name,
            color: req.body.color
        };
        
        const { data, error } = await supabase
            .from('folders')
            .insert([newFolder])
            .select();
            
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE folder
app.delete('/api/folders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        res.status(200).json({ message: 'Folder deleted' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export the app for Vercel
module.exports = app;

// Run local server if not in Vercel environment
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SnipSave local backend running on http://localhost:${PORT}`);
    });
}
