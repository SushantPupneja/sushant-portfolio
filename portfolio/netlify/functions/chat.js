// netlify/functions/chat.js
// Secure server-side proxy for the Anthropic Claude API.
// Your ANTHROPIC_API_KEY is stored as a Netlify environment variable
// and never exposed to the browser.

const SYSTEM_PROMPT = `You are an AI agent representing Sushant Pupneja on his personal portfolio website. Your job is to help recruiters and hiring managers learn about Sushant in a conversational, helpful, and professional way.

Here is everything you know about Sushant:

PERSONAL DETAILS
- Name: Sushant Pupneja
- Location: Doha, Qatar
- Email: sushant_pupneja@yahoo.com
- Mobile: +974-66475075
- Profile: Senior Software Developer / IoT & Platform Engineer

EXPERIENCE SUMMARY
- 6+ years of experience building IoT solutions for different industries
- Currently backend/platform engineer at Ooredoo (Qatar's leading telecom)
- Past companies: FunkyPuff.com (1 year), IBM (1.5 years), ZestIoT Pvt. Ltd (1 year), EnrichAI/Ooredoo Doha (2 years), Ooredoo Qatar (3 years)
- Side projects/ventures: Magic Carpet, Medheed.health

TECHNICAL SKILLS
Languages & Frameworks: Python, Django (DRF), Node.js, Express.js, REST APIs, Microservices
IoT Platforms: Cumulocity IoT (expert), MQTT, Mosquitto, Cedalo Platform, RabbitMQ, Memcached, TCP Agents
Cloud & DevOps: Microsoft Azure, AWS, Docker, HashiCorp Nomad, GitLab CI/CD
Databases: PostgreSQL, MongoDB, Amazon Redshift
Principles: SOLID, Data Model Design, Real-time Analytics, Batch Processing, ORM patterns
Soft tools: Trello, Asana, Miro

INDUSTRIES
Energy, Aviation, E-Commerce, Telecommunications

EDUCATION
Bachelor of Technology (B.Tech) — CEC Chandigarh, Computer Engineering

KEY PROJECTS

1. IoT Device Connector (Jan 2019 – Present, Ooredoo, Doha)
   - Receive data from heterogeneous device types in standard format
   - Deployed Cedalo Platform for MQTT Broker
   - Cumulocity Plugin in Python using REST APIs
   - Common TCP Agent in Node.js for multi-device type support
   - Device Authentication Service in Python/Django
   - Azure infrastructure using HashiCorp Nomad

2. IoT Devices Integration to Cumulocity (Jan 2019 – Jun 2021, EnrichAI–Ooredoo, Doha)
   - Integrated Concox, Dingtek Sensors, Robustel, Smartbox devices
   - Use cases: Waste Management, Asset Tracking, Fleet Management, Animal Tracking

3. Advanced Fleet Management (Apr 2018 – Dec 2018, EnrichAI, India)
   - Analytics for 200+ fleet vehicles
   - REST API in Node.js/Express + ORM with Django
   - Database design for PostgreSQL, MongoDB, Redshift
   - Real-time streaming on Cumulocity

4. Passenger Analytics via Facial Recognition (Oct 2017 – Mar 2018, ZestIoT, India)
   - Converting cameras into passenger intelligence for airports
   - Shopping behaviour tracking and analytics

5. Aircraft Turnaround Time Optimization (Apr 2017 – Sep 2017, ZestIoT, India)
   - Real-time visibility of aircraft airside operations
   - Automated delay detection and hub control system

6. Smart Metering Solution (Apr 2018 – Jul 2018, EnrichAI, India)
   - Smart meters for newly constructed apartments in Gurgaon
   - Prepaid electricity option + per-household consumption analytics

HOW TO RESPOND
- Be professional, enthusiastic, and concise
- Highlight Sushant's strengths naturally — his depth in IoT, cross-industry experience, and full-stack backend skills
- If asked about salary or negotiation details, say that's best discussed directly with Sushant
- If someone wants to contact Sushant, provide his email and phone
- Use bullet points when listing multiple items
- Sushant is open to Senior IoT, Platform Engineering, or Backend Engineering opportunities
- Speak warmly and professionally about Sushant in third person`;

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "API key not configured. Please set ANTHROPIC_API_KEY in Netlify environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages array required" }) };
  }

  // Basic rate limiting: cap conversation length
  const trimmedMessages = messages.slice(-20);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Upstream API error", detail: errText }),
      };
    }

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
