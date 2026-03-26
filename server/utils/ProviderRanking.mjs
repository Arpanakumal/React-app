
export const rankProviders = (providers, options = {}) => {
    const {
        ratingWeight = 0.4,
        jobWeight = 0.25,
        availabilityWeight = 0.15,
        acceptanceWeight = 0.1,
        recencyWeight = 0.1
    } = options;

    return providers
        .map((p) => {

            const rating = p.averageRating || 0;
            const ratingCount = p.ratingCount || 0;
            const completedJobs = p.completedJobs || 0;
            const acceptedJobs = p.acceptedJobs || 0;
            const rejectedJobs = p.rejectedJobs || 0;
            const lastActive = p.updatedAt || p.createdAt;

            const ratingScore = rating / 5;


            const jobScore = Math.log10(completedJobs + 1) / 2; 


            const availabilityScore = p.available ? 1 : 0;

            const totalResponses = acceptedJobs + rejectedJobs;
            const acceptanceRate =
                totalResponses > 0 ? acceptedJobs / totalResponses : 0.5;


            const daysSinceActive =
                (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);

            const recencyScore = Math.max(0, 1 - daysSinceActive / 30); 


            const score =
                ratingScore * ratingWeight +
                jobScore * jobWeight +
                availabilityScore * availabilityWeight +
                acceptanceRate * acceptanceWeight +
                recencyScore * recencyWeight;

            return {
                ...p.toObject(),
                rankingScore: Number(score.toFixed(4))
            };
        })
        .sort((a, b) => b.rankingScore - a.rankingScore);
};