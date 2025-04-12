import warnings, os
data_directory = os.path.join(os.path.dirname(__file__), "data")
print(data_directory)
import streamlit as st
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import HuggingFaceHub
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
import warnings, os
from dotenv import load_dotenv
warnings.filterwarnings("ignore")
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

# Load environment variables from .env file
load_dotenv()

data_directory = os.path.join(os.path.dirname(__file__), "data")

# Load the vector store from disk
try:
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'device': 'cpu'}
    )
    st.write("Embedding model loaded successfully.")
except NotImplementedError as e:
    st.error(f"NotImplementedError during embedding model initialization: {e}")
    raise
except Exception as e:
    st.error(f"Error initializing embedding model: {e}")
    raise

vector_store = Chroma(embedding_function=embedding_model, persist_directory=data_directory)

# Initialize the Hugging Face Hub LLM
hf_hub_llm = HuggingFaceHub(
    repo_id="meta-llama/Meta-Llama-3-8B-Instruct",
    model_kwargs={"temperature": 0.1, "max_new_tokens": 512}, # Reduced temp, reduced tokens
)

prompt_template = """
You are a helpful and knowledgeable AI assistant specializing in behavioral economics and decision-making, based on the book "Thinking, Fast and Slow" by Daniel Kahneman.

Your goal is to provide accurate, concise, and insightful answers to user questions, drawing directly from the concepts and examples presented in the book. 

Follow these guidelines:

*   **Accuracy and Relevance:** Always prioritize accuracy and relevance to the user's query. Base your responses on the principles and findings discussed in "Thinking, Fast and Slow."
*   **Conciseness:** Keep your answers concise and to the point. Avoid unnecessary jargon or lengthy explanations.
*   **Clarity:** Explain complex concepts in a clear and easy-to-understand manner. Use examples from the book whenever possible.
*   **Avoid Repetition:** Do not repeat the same information or phrases within a single response or across multiple interactions. Ensure each answer is unique and contributes new insights.
*   **No Extraneous Information:** Do not add information that is not directly related to the user's question or the content of "Thinking, Fast and Slow." Do not ask clarifying questions.
*   **Focus on Principles:** Emphasize the underlying psychological principles and biases discussed in the book, rather than providing generic advice.
*   **Limited Scope:** Only answer questions related to behavioral economics, cognitive biases, and decision-making as covered in "Thinking, Fast and Slow." For questions outside this scope, politely decline to answer.
*   **Direct Answers:** Provide direct answers to questions without unnecessary introductory or concluding remarks.
*   **No Sign-offs:** Do not include any sign-offs, such as "Best regards" or "As an AI assistant."

Use this context from "Thinking, Fast and Slow":
{context}

Question: {question}

Answer:
"""

custom_prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

rag_chain = RetrievalQA.from_chain_type(
    llm=hf_hub_llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(top_k=3),
    chain_type_kwargs={"prompt": custom_prompt}
)

def get_response(question):
    result = rag_chain({"query": question})
    response_text = result["result"]
    answer_start = response_text.find("Answer:") + len("Answer:")
    answer = response_text[answer_start:].strip()
    return answer

# Streamlit app
st.markdown("""
    <h3 style='text-align: left; color: white; padding-top: 35px; border-bottom: 3px solid green;'>
        💸 Unlock Insights from your transactions."
    </h3>""", unsafe_allow_html=True)

side_bar_message = """
Hi! 👋 I'm your personal counsellor"

Ask me about:
\n1. **System 1 & System 2 Thinking**
\n2. **Cognitive Biases**
\n3. **Heuristics**
\n4. **Decision-Making**

I'll provide concise answers based on the book!
"""

with st.sidebar:
    st.title('🧠 Reznova AI: Your Finance Companion')
    st.markdown(side_bar_message)

initial_message = """
Hello! I am your Reznova Ai"

Here are some questions you can ask:
\n💸 What is the difference between System 1 and System 2 thinking?
\n💸 Explain the availability heuristic.
\n💸 What is loss aversion, and how does it affect decisions?
\n💸 Describe prospect theory.
\n💸 What is the planning fallacy?
"""

# Initialize or retrieve chat messages from session state
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": initial_message}]

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Clear the Chat
def clear_chat_history():
    st.session_state.messages = [{"role": "assistant", "content": initial_message}]
st.button('Clear Chat', on_click=clear_chat_history)

# Handle user input
if prompt := st.chat_input("Ask me anything about Finance!"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                response = get_response(prompt)

                # Check for repetition (basic example - can be improved)
                if len(st.session_state.messages) > 2 and response == st.session_state.messages[-2]["content"]:
                    response = "I apologize, I seem to be having trouble finding a new answer.  Please try rephrasing your question." # Simple way to stop repetition
                st.markdown(response) #Display the answer
                st.session_state.messages.append({"role": "assistant", "content": response})
            except Exception as e:
                st.error(f"Error generating response: {e}")
                raise
