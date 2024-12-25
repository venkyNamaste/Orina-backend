const express = require("express");
const { TextGeneration } = require("deepinfra");
require("dotenv").config();

const deepRouter = express.Router();

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const MODEL_URL = "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3-8B-Instruct";

// const booleanPrompt = `
// You are an expert Boolean string generator specializing in crafting precise and effective Boolean search queries for talent acquisition and recruitment. 
// Your task is to thoroughly analyze the given job description (JD) and construct **five distinct Boolean search strings** that are optimized for sourcing candidates from various platforms like LinkedIn, job boards, and resume databases. 
// You are highly skilled in utilizing advanced search operators such as **AND**, **OR**, **NOT**, parentheses for grouping, and quotation marks for exact phrases, while also identifying and prioritizing the most relevant keywords from the JD.

// ### Instructions:
// 1. **Analyze the Job Description:** 
//    Carefully extract key skills, qualifications, job titles, tools, certifications, and any other relevant criteria mentioned in the JD. Ensure that your Boolean strings are tailored to the specific requirements of the role.

// 2. **Craft Boolean Strings:** 
//    Create **five separate Boolean strings**, each emphasizing slightly different aspects of the JD to maximize search coverage. These strings should:
//    - Combine **required skills** with **optional skills** to create comprehensive queries.
//    - Address potential variations in job titles, certifications, and tools (e.g., synonyms, abbreviations, alternative phrasing).
//    - Be designed for use on platforms like LinkedIn or job boards (e.g., avoiding characters incompatible with certain search engines).
//    - Exclude irrelevant profiles by adding **NOT operators** for unrelated roles or industries, if needed.

// 3. **Include Variations:** 
//    Ensure diversity in your Boolean strings by targeting:
//    - Different synonyms for skills, job titles, or certifications (e.g., "Software Engineer" OR "Developer").
//    - Variations in tools or technologies (e.g., "Python" OR "Django" OR "Flask").
//    - Alternate phrasing for soft skills or specific methodologies.

// 4. **Provide Explanation:** 
//    After each Boolean string, include a brief explanation of how it was constructed and the specific focus of the query.

// ### Additional Considerations:
// - Use quotation marks ("") for exact phrases and keywords where applicable.
// - Use parentheses () to group related terms for clarity and to ensure accurate Boolean logic.
// - Use the **AND operator** to connect mandatory terms and the **OR operator** to group alternatives or optional terms.

// ---

// ### Example Response Format:
// **Job Description:** [Insert the provided job description here.]

// #### Boolean String 1: 
// \`
// ("Software Engineer" OR "Software Developer" OR "Backend Developer") AND ("Python" OR "Django" OR "Flask") AND ("REST APIs" OR "Web Services") AND ("AWS" OR "Cloud" OR "Azure")
// \`
// **Explanation:** 
// This string focuses on core technical skills (Python, Django, Flask) and experience with cloud platforms (AWS, Azure) mentioned in the JD, targeting candidates with backend development expertise.

// #### Boolean String 2: 
// \`
// ("Full-Stack Developer" OR "Software Engineer") AND ("React" OR "Angular" OR "Vue.js") AND ("JavaScript" OR "TypeScript") AND ("Node.js" OR "Express.js") NOT ("Intern")
// \`
// **Explanation:** 
// This query targets candidates with full-stack development experience, emphasizing front-end frameworks and JavaScript/TypeScript skills while excluding interns.

// #### Boolean String 3: 
// [Insert Boolean string here along with explanation.]

// #### Boolean String 4: 
// [Insert Boolean string here along with explanation.]

// #### Boolean String 5: 
// [Insert Boolean string here along with explanation.]

// ---

// Use the provided JD to create these Boolean strings. Ensure they are accurate, relevant, and ready for immediate application in candidate sourcing tasks.
// `;


// 1. Generate and Format JD



deepRouter.post("/generate-jd", async (req, res) => {
  try {
    const { input } = req.body;
    console.log("input", input);
    const prompt = `You are an expert in organizing job descriptions. 
    The job description must be formatted in rich text format which includes html tags. Avoid using any other formats or 
    representations for the job description.
    EXAMPLE RESPONSE - 
     " <p>We are seeking an experienced Java Developer with a strong background in J2EE to 
     join our team in Los Angeles. The successful candidate will have a passion for software
    development and a keen eye for detail.</p> <h4>Responsibilities:</h4> <ul> <li>Develop,
      test, and maintain large-scale Java applications using J2EE technologies.</li> <li>Design
       and implement scalable, efficient, and reliable software systems.</li> <li>Collaborate
       with cross-functional teams to identify and prioritize project requirements.</li> 
       <li>Write clean, well-documented, and testable code in Java.</li> <li>Participate
      in code reviews and contribute to the improvement of the codebase.</li> </ul> 
        <h4>Tools:</h4> <ul> <li>Java, J2EE</li> <li>Spring, Hibernate</li> <li>Docker, 
          Kubernetes</li> <li>AWS or Azure</li> <li>Git for version control</li> </ul> <h4>Career Level:</h4>
           <p>Mid to Senior Level</p> <h4>Industry Type:</h4> <p>Information Technology and Services</p>
            <h4>Mandatory Skills:</h4> <ul> <li>Java, J2EE</li> <li>Spring Framework</li> <li>Hibernate</li> 
            <li>Cloud platforms (AWS, Azure)</li> <li>Containerization (Docker)</li> </ul> <h4>Roles:</h4> <ul>
             <li>Java Developer</li> <li>Software Engineer</li> <li>Back-end Developer</li> </ul>
              <h4>Location Type:</h4> <p>On-site (Los Angeles, CA)</p> <h4>Job Type:</h4> <p>Full-Time</p>
               <h4>Compensation:</h4> <p>$100,000 - $120,000 per year, depending on experience</p>
                <h4>Mandatory Requirements:</h4> <ul> <li>5+ years of experience in Java development with a strong focus on J2EE.</li> 
                <li>Proven track record of delivering high-quality software solutions.</li> 
                <li>Strong understanding of software design patterns and principles.</li> 
                <li>Excellent problem-solving skills and attention to detail.</li>
                 <li>Ability to work effectively in a collaborative team environment.</li> 
                 </ul> <h4>Preferred Qualifications:</h4> <ul> <li>Experience with cloud platforms such as AWS or Azure.</li> 
                 <li>Knowledge of containerization using Docker.</li> <li>Familiarity with agile development methodologies.</li> 
                 </ul> <p>If you are a motivated and talented Java Developer with a passion for J2EE, we encourage you to apply 
                 for this exciting opportunity.</p>"

                HERE is the job dscription with additional information:\n\n${input}
    `;
    const client = new TextGeneration(MODEL_URL, DEEPINFRA_API_KEY);

    const response = await client.generate({
      input: prompt,
      stop: ["<|eot_id|>"],
    });

    res.json({ generatedText: response.results[0].generated_text });
  } catch (error) {
    console.error("Error in DeepInfra API:", error.message);
    res.status(500).json({ error: "Failed to generate JD" });
  }
});

// 2. Identify Skills and Client Requirements
deepRouter.post("/identify-skills", async (req, res) => {
  try {
    const { input } = req.body;
    const prompt = `
    Before starting, cleaing everything and start as a fresh.
    You are a senior recruitment manager. After thoroughly reviewing the provided job description, craft a strategic,
    
    high-level analysis that clearly articulates the client’s hiring needs.
     Start with: "The client is looking for someone..." and proceed to highlight the core competencies,
      qualifications, and experience required for the role. Emphasize the strategic importance of the position and how the ideal 
      candidate will contribute to organizational goals. Maintain a professional, recruitment-focused tone, ensuring the response
       is concise, insightful, and aligned with the client's expectations. Limit your analysis to precisely five lines.

        The analysis should:
       Demonstrate deep understanding of the job description
       Highlight critical skills and experience
       Provide insights into the role's strategic importance
      Use professional, recruitment-focused language
      Offer a comprehensive yet precise overview of candidate expectations 

      EXAMPLE RESPONSE:
      {{
      response: ["line 1", "line 2", "line 3", "line 4", "line 5"]
      }}
      IMPORTANT: EACH LINE SHOULD CONTAIN LESS THN 60 WORDS

      NOTE: STRICTLY GIVE YOUR RESPONSE ONLY IN 5 LINES

    OUTPUT SHOULD JUST CONTAIN GENERATD RESPONSE THATS IT. NO JD OR NOTHING
    ${input}
    `;
    const client = new TextGeneration(MODEL_URL, DEEPINFRA_API_KEY);

    console.log("prompt", prompt);

    const response = await client.generate({
      input: prompt,
      stop: ["<|eot_id|>"],
    });

    res.json({ generatedText: response.results[0].generated_text });
  } catch (error) {
    console.error("Error identifying skills:", error.message);
    res.status(500).json({ error: "Failed to identify skills" });
  }
});

// 3. Generate Boolean Analysis
deepRouter.post("/generate-boolean", async (req, res) => {
    try {
      const { input } = req.body;
  
      const booleanPrompt = `
      You are an expert Boolean string generator specializing in crafting precise Boolean search queries for candidate sourcing.
      Analyze the provided job description and **generate exactly five Boolean search strings**.
      
      ### Requirements:
      - Use the **AND** operator to include mandatory terms.
      - Use the **OR** operator to provide synonyms or variations.
      - Exclude irrelevant candidates using **NOT** conditions.
      - **Do NOT include or repeat the raw job description in the response.**
      - Each Boolean string should focus on key skills, tools, and job titles from the input JD.
      - Separate the five Boolean strings with line breaks.
  
      ### Example Format:
      Boolean String 1: (Skill1 OR Skill2) AND (Tool1 OR Tool2) NOT (Unrelated Term1 OR Unrelated Term2)
      Boolean String 2: (....)
      Boolean String 3: (....)
      Boolean String 4: (....)
      Boolean String 5: (....)
  
      Now generate five Boolean strings for the following input:

      OUTPUT SHOULD JUST CONTAIN GENERATD BOOLEAN STRINGS THATS IT. NO JD NOTHING
      ${input}
      `;
  
      const client = new TextGeneration(MODEL_URL, DEEPINFRA_API_KEY);
      const response = await client.generate({
        input: booleanPrompt,
        stop: ["<|eot_id|>"],
      });
  
      const generatedText = response.results[0].generated_text;
  
      res.json({ generatedText: generatedText });
    } catch (error) {
      console.error("Error generating Boolean strings:", error.message);
      res.status(500).json({ error: "Failed to generate Boolean strings" });
    }
  });
  

module.exports = deepRouter;
