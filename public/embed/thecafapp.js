/**
 * THE CAF APP | EMBED SCRIPT
 *  (C) 2024 Micah Lindley
 * --------------------------
 *  to initialize, call thecafapp.init()
 *  with the selector of the embed element
 *  as the argument.
 */
window.thecafapp = {
    init: async (rootElement) => {
        const d = document;
        const req = await fetch("https://mc.thecaf.app/api/menu");
        const data = await req.json();
        window.thecafapp.data = data;
        const root = d.querySelector(rootElement);
        const header = d.createElement("h1");
        header.innerText = `Menu for ${data.date}`;
        root.appendChild(header);
        data.meals.forEach((meal) => {
            const m = d.createElement("div");
            m.setAttribute("id", meal.name);
            const title = d.createElement("h2");
            title.innerText = meal.name;
            m.appendChild(title);
            const menu = d.createElement("ul");
            meal.menu.forEach((food) => {
                const f = d.createElement("li");
                f.innerText = food;
                menu.appendChild(f);
            });
            if (meal.menu.length < 1) {
                const missing = d.createElement("li");
                missing.innerText = "No menu posted";
                menu.appendChild(missing);
            }
            m.appendChild(menu);
            root.appendChild(m);
        });
    },
};
