const express = require("express");
const { TextGeneration } = require("deepinfra");
const PromptsModel = require("../models/prompts");
require("dotenv").config();

const deepRouter = express.Router();

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const MODEL_URL = process.env.DEEP_MODEL_URL;

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

    const prompt = await PromptsModel.findOne({})
    console.log("Prompt", prompt)
    const finalPrompt = prompt.prompt1
    const promptModel = `
    ${finalPrompt}
    :\n\n${input}
    `;
    const client = new TextGeneration(MODEL_URL, DEEPINFRA_API_KEY);

    const response = await client.generate({
      input: promptModel,
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

    const prompt = await PromptsModel.findOne({})
    console.log("Prompt", prompt)
    const finalPrompt = prompt.prompt2

    const promptmodel = `
    ${finalPrompt} 
    ${input}
    `;
    const client = new TextGeneration(MODEL_URL, DEEPINFRA_API_KEY);

    const response = await client.generate({
      input: promptmodel,
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

      const prompt = await PromptsModel.findOne({})
      console.log("Prompt", prompt)
      const finalPrompt = prompt.prompt3

      console.log("finalPrompt", finalPrompt)
  
      const booleanPrompt = `
     ${finalPrompt}
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
