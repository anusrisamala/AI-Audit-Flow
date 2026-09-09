require("dotenv").config();
const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function test() {
  try {
    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "user",
          content: "Reply with only the word Hello."
        }
      ]
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error(error);
  }
}

test();