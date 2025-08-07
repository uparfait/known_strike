module.exports = async function check_urls_availability(url_list) {
    const failed_urls = {};
    let all_ok = true;

    for (const url of url_list) {
        try {
            const response = await fetch(url, { method: "HEAD" });
            if (!response.ok) {
                failed_urls[url] = response.status;
                all_ok = false;
            }
        } catch (error) {

            failed_urls[url] = error.message.includes("Failed to fetch")
                ? "Network Error"
                : "Invalid URL";
            all_ok = false;
        }
    }

    return all_ok ? true : failed_urls;
};
