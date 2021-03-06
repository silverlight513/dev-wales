const db = require("../db");
const { createCache, isCacheValid } = require("../utils/cache");

const cache = createCache();

function fetchJobs() {
  let data = [];
  return new Promise((resolve, reject) => {
    db("Jobs")
      .select({
        view: "Grid view",
        sort: [{ field: "title", direction: "asc" }]
      })
      .eachPage(
        function page(records, fetchNextPage) {
          data = records.map(record => {
            return {
              title: record.get("title"),
              link: record.get("link"),
              companyId: record.get("company_id")[0]
            };
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        }
      );
  });
}

function getJobs(callback) {
  if (isCacheValid(cache)) {
    console.log("Returning jobs from cache");
    callback(cache.data);
    return;
  }
  console.log("Refreshing jobs cache");
  fetchJobs().then(data => {
    cache.data = data;
    cache.lastUpdated = Date.now();
    callback(data);
  });
}

module.exports = {
  getJobs
};
