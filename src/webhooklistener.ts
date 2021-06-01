import { log } from "./util/logger"

export function initListener(): void {
    const express = require("express")
    const bodyParser = require("body-parser")

    // Initialize express and define a port
    const app = express()
    const PORT = 3000

    // Tell express to use body-parser's JSON parsing
    app.use(bodyParser.json())

    app.post("/hook", (req: any, res: any) => {
        console.log(req.body) // Call your action on the request here
        res.status(200).end() // Responding is important
    })

    // Start express on the defined port
    app.listen(PORT, () => log(`🚀 Server running on port ${PORT}`))
};