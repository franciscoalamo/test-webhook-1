import axios from 'axios'
import { Jira } from '../../interfaces';
import { loadEnvironmentVariables } from '../env';

export const JIRA_VERSION = "https://jira.grandvision.global/rest/api/2/version";
export const JIRA_TICKET = "https://jira.grandvision.global/rest/api/2/issue/"
export const JIRA_BASE = "https://jira.grandvision.global/browse/"
export function post(url: string) {
  return (headers: any) => async (body: any) => {
    const response = await axios.post(url, body, headers)
    return response
  }
}

export async function postJira(ticket: string,msg: string) {
  const { JIRA_USER, JIRA_PASSWORD } = await loadEnvironmentVariables<Jira>()
  const response = await axios.post(
    JIRA_TICKET + ticket + "/comment", 
    {"body": msg},
    {
      auth: {
        username: JIRA_USER,
        password: JIRA_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
  return response
}

export async function setVersionJira(ticket: string,version: string) {
  const { JIRA_USER, JIRA_PASSWORD } = await loadEnvironmentVariables<Jira>()
  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  await axios.post(
    JIRA_VERSION, 
    {"description": `Version ${version}`,"name": version,"archived": false,"released": true,"userReleaseDate": `${today.getDate()}/${monthNames[today.getMonth()]}/${today.getFullYear()}`,"project": "CXSD","projectId": 12900},
    {
      auth: {
        username: JIRA_USER,
        password: JIRA_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
  const response = await axios.post(
    JIRA_TICKET + ticket, 
    {"update": { "fixVersions": [{"set" : [{"name" : version}] }] }},
    {
      auth: {
        username: JIRA_USER,
        password: JIRA_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
  return response
}

export async function getUserTicket(ticket: string): Promise<string> {
  const { JIRA_USER, JIRA_PASSWORD } = await loadEnvironmentVariables<Jira>()
  const response = await axios.get(
    JIRA_TICKET + ticket,
    {
      auth: {
        username: JIRA_USER,
        password: JIRA_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
  return response.data.fields.assignee.key
}