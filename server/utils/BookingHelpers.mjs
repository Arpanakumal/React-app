export const calculateProviderEarnings = (booking, hoursWorked = null) => {
    const providerCount = booking.providerCount || 1;

    let finalPrice;

    if (hoursWorked !== null) {
        finalPrice = booking.pricePerHour * hoursWorked * providerCount;
    } else {
        finalPrice = booking.finalPrice || booking.pricePerHour * providerCount;
    }

    finalPrice = Math.round(finalPrice);

    let commissionAmount =
        (finalPrice * (booking.commissionPercent || 0)) / 100;

    commissionAmount = Math.round(commissionAmount);

    let providerEarning = finalPrice - commissionAmount;
    providerEarning = Math.round(providerEarning);

    const acceptedProviders = booking.providerCommissions.filter(
        (pc) => pc.accepted
    );

    let perProviderCommission = 0;
    let perProviderEarning = 0;

    if (acceptedProviders.length > 0) {
        perProviderCommission = Math.floor(commissionAmount / acceptedProviders.length);
        perProviderEarning = Math.floor(providerEarning / acceptedProviders.length);

        let commissionRemainder =
            commissionAmount - perProviderCommission * acceptedProviders.length;

        let earningRemainder =
            providerEarning - perProviderEarning * acceptedProviders.length;

        booking.providerCommissions = booking.providerCommissions.map((pc, index) => {
            if (!pc.accepted) return pc;

            const obj = pc.toObject ? pc.toObject() : pc;

            return {
                ...obj,
                commissionShare:
                    perProviderCommission + (index === 0 ? commissionRemainder : 0),
                earningShare:
                    perProviderEarning + (index === 0 ? earningRemainder : 0),
                commissionPaid: pc.commissionPaid || false,
            };
        });
    }

    return {
        finalPrice,
        commissionAmount,
        providerEarning,
        booking,
    };
};