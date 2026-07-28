export const notificationTarget = (item) =>
  item.community?.slug ? `/communities/${item.community.slug}` : item.diary ? "/diary" : "/dashboard";
