import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ExtractedSkills {
  skills: string[];
  experience?: string;
  categories?: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
}

export const extractSkillsFromCVText = async (
  cvText: string
): Promise<ExtractedSkills> => {
  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following CV/Resume text and extract all relevant skills, technologies, and competencies. 
      Return the response in the following JSON format:
      
      {
        "skills": ["skill1", "skill2", "skill3", ...],
        "experience": "brief summary of years of experience",
        "categories": {
          "technical": ["programming languages", "frameworks", "databases", ...],
          "soft": ["communication", "leadership", "problem-solving", ...],
          "languages": ["English", "Spanish", ...],
          "tools": ["software", "platforms", "IDEs", ...]
        }
      }

      Focus on:
      1. Programming languages (JavaScript, Python, Java, etc.)
      2. Frameworks and libraries (React, Node.js, Django, etc.)
      3. Databases (MySQL, MongoDB, PostgreSQL, etc.)
      4. Cloud platforms (AWS, Azure, GCP, etc.)
      5. Design tools (Figma, Photoshop, etc.)
      6. Soft skills (Leadership, Communication, etc.)
      7. Certifications and qualifications
      8. Spoken languages
      
      Extract only actual skills mentioned in the text. Don't make assumptions.
      
      CV Text:
      ${cvText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse JSON from the response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const extractedData = JSON.parse(cleanedText);

      // Ensure we have at least a skills array
      return {
        skills: extractedData.skills || [],
        experience: extractedData.experience || '',
        categories: extractedData.categories || {
          technical: [],
          soft: [],
          languages: [],
          tools: [],
        },
      };
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response:', parseError);

      // Fallback: extract skills using regex if JSON parsing fails
      const skillsRegex = /["']([^"']+)["']/g;
      const matches = text.match(skillsRegex);
      const fallbackSkills = matches
        ? matches.map((match) => match.replace(/["']/g, ''))
        : [];

      return {
        skills: fallbackSkills.slice(0, 20), // Limit to 20 skills
        experience: '',
        categories: {
          technical: [],
          soft: [],
          languages: [],
          tools: [],
        },
      };
    }
  } catch (error) {
    console.error('Error extracting skills with Gemini:', error);
    throw new Error('Failed to extract skills from CV');
  }
};

export const validateCVText = (text: string): boolean => {
  // Basic validation to ensure the text looks like a CV
  const cvKeywords = [
    'experience',
    'education',
    'skills',
    'work',
    'university',
    'degree',
    'certification',
    'project',
    'responsibility',
    'achievement',
    'resume',
    'curriculum',
  ];

  const lowercaseText = text.toLowerCase();
  const foundKeywords = cvKeywords.filter((keyword) =>
    lowercaseText.includes(keyword)
  );

  // Should have at least 2 CV-related keywords and be longer than 100 characters
  return foundKeywords.length >= 2 && text.length > 100;
};


export const generateJobDetailsAI = async (
  title: string,
  category: string,
  subcategory: string,
  type: string
): Promise<{ description: string; skills: string }> => {
  const prompt = `
    Act as a professional recruiter and job marketplace expert.
    A client is posting a new job/project. Based on the provided details, generate:

    1. A **long and detailed job description** (at least 250+ words).
       - Explain the scope of work clearly.
       - Mention expectations from the freelancer.
       - Add relevant technical and soft requirements.
       - Keep the tone professional, like a real client posting on Upwork/Fiverr.
    
    2. A **list of required skills**, returned as a single comma-separated string.
       - Only include the most relevant technical and domain-specific skills.
       - Keep the list short and precise (5–12 skills).

    Job Details:
    - Title: ${title}
    - Category: ${category}
    - Subcategory: ${subcategory} 
    - Job Type: ${type} 

    Respond strictly in JSON format:
    {
      "description": "long job description here...",
      "skills": "skill1, skill2, skill3, ..."
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Clean and parse JSON
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    description: parsed.description || '',
    skills: parsed.skills || '',
  };
};