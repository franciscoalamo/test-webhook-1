import { log } from "./util/logger"
import ngrok from 'ngrok'
import { loadEnvironmentVariables } from './util/env/index';
import { Ngrok } from './interfaces/index';
import { sendMessageToSlack } from ".";
import { getUserTicket, JIRA_BASE } from "./util/http";

export function initListener(): void {
    const express = require("express")
    const bodyParser = require("body-parser")

    // Initialize express and define a port
    const app = express()
    const PORT = 3000

    // Tell express to use body-parser's JSON parsing
    app.use(bodyParser.json())

    app.post("/hook", async (req: any, res: any) => {
        if (req.body && req.body.action && req.body.action === 'created' && req.body.release) {
            if (req.body.release.body.includes('CXSD')) {
                const tickets: string [] = [];
                const users: Map<string,string> = new Map([
                    ["alvaro.castellanos@grandvision.com","UV9M0N9AA"],
                    ["francisco.alamo@grandvision.com","UV7FCRF0V"],
                    ["emilio.estebanez@grandvision.com","UUUJ0K9EE"],
                    ["enrique.delascuevas@grandvision.com","UV7EUD932"],
                    ["jorge.delgado@grandvision.com","UKZJTS9G8"],
                    ["javier.garcia@grandvision.com","U016UQJ817ZA"],
                ])
                const text: string = req.body.release.body;
                for (const line of text.split("\n")) {
                    if (line.includes("CXSD")) {
                        const key = line.substring(line.indexOf("CXSD"),line.indexOf(")",line.indexOf("CXSD")));
                        if (key !== '') {
                            const prURL = `<https://github.com/GrandVisionHQ/gv-core-components/pull/${line.substring(line.indexOf("(#") + 2,line.indexOf(")"))}|${line.substring(line.indexOf("(#") + 1,line.indexOf(")"))}>`
                            const ticketURL = `<${JIRA_BASE+key}|${key}>`
                            const user = `<@${users.get(await getUserTicket(key))}>`
                            const value = line.substring(0,line.indexOf("(")) + " | PR: " + prURL + " | Ticket: "+ticketURL+" | "+user;
                            tickets.push(value)
                        }
                    }
                }
                let textFormated = ""
                for (const ticket of tickets) {
                    textFormated += ticket + "\n"
                }
                sendMessageToSlack(`🎉 New Release 🎉\n ${textFormated}`)
                
            }
        }
        console.log(req.body)
        if (req.body && req.body.action && req.body.state === 'approved') {
            console.log("New PR approved")
        }
        //console.log(req.body)
        res.status(200).end() // Responding is important
    })
    // Start express on the defined port
    app.listen(PORT, () => log(`🚀 Server running on port ${PORT}`))
    //startNgrok()
};

async function startNgrok(){
    const { NGROK_TOKEN } = await loadEnvironmentVariables<Ngrok>()
    const url = await ngrok.connect({authtoken: NGROK_TOKEN, proto: 'http',addr: 3000});
    log(`🚀 Server running on url ${url}`)
}
