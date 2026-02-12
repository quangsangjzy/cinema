// Mock API for Member page. Replace with real calls (axios/fetch) later.
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getProfile() {
  await delay(300);
  return {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: null,
    email: "nguyenvana@example.com",
    phone: "0909123456",
    birthday: "1992-05-06",
    totalSpent: 100000, // VND
    tier: "Normal",
  };
}

export async function getOrders() {
  await delay(300);
  return [
    { id: "o1", date: new Date().toISOString(), movie: "Avengers", theater: "Galaxy Cầu Giấy", seats: ["A1","A2"], amount: 150000, pointsEarned: 15 },
    { id: "o2", date: new Date(Date.now()-86400000*10).toISOString(), movie: "Matrix 4", theater: "BHD Star", seats: ["B3"], amount: 80000, pointsEarned: 8 },
  ];
}

export async function getPoints() {
  await delay(200);
  return 250;
}

export async function updateProfile(payload) {
  await delay(300);
  // return updated profile on success
  return { ...payload };
}
