import Provider from "../models/ProviderModel.mjs";

export const listProviders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const providers = await Provider.find()
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ data: providers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createProvider = async (req, res) => {
    try {
        const provider = new Provider(req.body);
        await provider.save();
        res.json({ data: provider });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
