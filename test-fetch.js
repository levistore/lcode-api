fetch("http://localhost:3000/api/auth/me")
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => {
    console.log("Body snippet:", text);
  })
  .catch(err => {
    console.error("Fetch error:", err);
  });
