import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_classic.chains.retrieval import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

# Initialize embeddings and retriever globally to avoid loading them on every request
print("Loading embeddings model...")
model_name = "sentence-transformers/all-MiniLM-L6-v2"
embedding = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True, "batch_size": 32}
)

print("Loading FAISS index...")
# Use allow_dangerous_deserialization=True as FAISS requires it
docsearch = FAISS.load_local("faiss_index", embedding, allow_dangerous_deserialization=True)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

print("Initializing LLM and Chain...")
llm = ChatGroq(
    model_name="openai/gpt-oss-20b",
    temperature=0.4,
    max_tokens=500,
    api_key=os.getenv("GROQ_API_KEY")
)

system_prompt = (
    "You are an expert veterinary assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the farmer's question about animal diseases and symptoms. "
    "If you don't know the answer, say that you don't know. "
    "Keep the answer concise and helpful.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

def get_chat_response(query: str) -> str:
    try:
        response = rag_chain.invoke({"input": query})
        return response.get("answer", "I could not find an answer.")
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return "Sorry, I am facing an issue right now. Please try again later."
