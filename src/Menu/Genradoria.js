export const generarMenu = async (preferencias, plan) => {
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generarMenu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: preferencias?.userId,
      preferencias: preferencias,
      plan: plan,
    }),
  });

  const data = await resp.json();

  return data.menu;
};
