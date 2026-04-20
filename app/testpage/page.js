
async function removeUserLoginData(userId) {
  const res = await fetch("/api/delete-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(data.error);
    return;
  }

  router.push("/");
}