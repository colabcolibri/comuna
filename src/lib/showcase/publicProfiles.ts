export function filterPublicShowcaseProfiles(members: any[]) {
  return members
    .filter(m => m.is_public_showcase === true)
    .map(m => {
      // DTO Sanitizado (Remove e-mail e contatos diretos)
      const { email, whatsapp, ...publicDTO } = m;
      return publicDTO;
    });
}
