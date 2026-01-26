import Provider from "../models/ProviderModel.mjs";

export const addProvider = async (req, res) => {
    try {

        const providerData = { ...req.body };
        if (req.file) {
            providerData.image = req.file.filename;
        }

        const provider = new Provider(providerData);
        await provider.save();

        res.json({ success: true, data: provider });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
