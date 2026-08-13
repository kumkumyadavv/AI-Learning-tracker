import os
import json

from dotenv import load_dotenv
from google import genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_roadmap(goal, ai_input):

    prompt = f"""
Generate a learning roadmap in STRICT JSON.

Goal Title: {goal.title}
Description: {goal.description}
Target Date: {goal.target_date}

Skill Level: {ai_input.skill_level}
Daily Hours: {ai_input.daily_hours}
Learning Style: {ai_input.learning_style}

Return ONLY valid JSON.

Format:
{{
  "phases": [
    {{
      "phase_title": "string",
      "subtasks": [
        {{
          "title": "string",
          "resources": [
            {{
              "title": "string",
              "url": "string",
              "resource_type": "video/article/practice"
            }}
          ]
        }}
      ]
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    print(response.text)

    clean_text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    roadmap_data = json.loads(clean_text)

    return roadmap_data


class DummyGoal:

    title = "Learn DSA"
    description = "For product-based company interviews"
    target_date = "2026-12-31"


class DummyInput:

    skill_level = "beginner"
    daily_hours = 2
    learning_style = "practice"


if __name__ == "__main__":

    dummy_goal = DummyGoal()
    dummy_ai_input = DummyInput()

    print(
        generate_roadmap(
            dummy_goal,
            dummy_ai_input
        )
    )