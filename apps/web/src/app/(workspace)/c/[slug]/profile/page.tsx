'use client';

import { ProfileForm } from '@/components/app/ProfileForm';
import { TalentOffers } from '@/components/app/TalentOffers';

export default function CommunityProfilePage() {
  return (
    <ProfileForm scope="community" extra={<TalentOffers />} />
  );
}
