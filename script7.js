require("axios-https-proxy-fix")
  .get("http://www.google.com/search?q=pizza", {
    rejectUnauthorized: false,
    proxy: {
      host: "brd.superproxy.io",
      port: "22225",
      auth: {
        username: "brd-customer-hl_853774fc-zone-serp_api2-country-br",
        password: "knd9cdg080ke",
      },
    },
  })
  .then(
    function (data) {
      console.log(data);
    },
    function (err) {
      console.error(err);
    }
  );
