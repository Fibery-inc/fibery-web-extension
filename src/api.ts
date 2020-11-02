const getMeUrl = `${process.env.REACT_APP_HOST || ""}/api/users/me`;

async function getData(url: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error");
  }
  return response.json();
}

export const getMe = () => {
  return getData(getMeUrl);
};
