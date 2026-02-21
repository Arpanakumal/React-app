
export const calculateProviderEarnings = (booking, hoursWorked = null) => {
    const providerCount = booking.providerCount || 1;
    let finalPrice;
    let commissionAmount;
    let providerEarning;

    if (hoursWorked !== null) {
        // Booking completed based on hours worked
        finalPrice = booking.pricePerHour * hoursWorked * providerCount;
    } else {
        finalPrice = booking.finalPrice || booking.pricePerHour * providerCount;
    }

    commissionAmount = (finalPrice * (booking.commissionPercent || 0)) / 100;
    providerEarning = finalPrice - commissionAmount;

    const acceptedProviders = booking.providerCommissions.filter(pc => pc.accepted);

    const perProviderCommission = acceptedProviders.length
        ? commissionAmount / acceptedProviders.length
        : 0;

    const perProviderEarning = acceptedProviders.length
        ? providerEarning / acceptedProviders.length
        : 0;

    // Update earnings for each provider slot
    booking.providerCommissions = booking.providerCommissions.map(pc => {
        if (pc.accepted) {
            return {
                ...pc.toObject ? pc.toObject() : pc, 
                commissionShare: perProviderCommission,
                earningShare: perProviderEarning,
                commissionPaid: pc.commissionPaid || false
            };
        }
        return pc;
    });

    return { finalPrice, commissionAmount, providerEarning, booking };
};