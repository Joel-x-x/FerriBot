import { GoogleGenerativeAI } from "@google/generative-ai";

        const API_KEY = 'AIzaSyBpdJAUiGmbesEZnjDrV9D3DJ7IDu3FQC8';
        const genAI = new GoogleGenerativeAI(API_KEY);

        let conversationHistory = "";

        const loadRules = async () => {
            try {
                const response = await fetch('reglas.txt');
                if (response.ok) {
                    const text = await response.text();
                    conversationHistory = text;
                } else {
                    console.error('Error al cargar las reglas:', response.statusText);
                }
            } catch (error) {
                console.error('Error al cargar las reglas:', error);
            }
        };

        const preprocessResponse = (responseText) => {
            return responseText.replace(/\*\*/g, '<br>').replace(/\*/g, '<br>');
        };

        const sendMessage = async () => {
            const inputText = document.getElementById('inputText').value;
            if (!inputText) return;

            const chatBox = document.getElementById('chatBox');

            // Agregar el mensaje del usuario al chat
            const userMessage = document.createElement('div');
            userMessage.classList.add('message', 'user');
            userMessage.innerHTML = `<img src="User.png" alt="User"><p>${inputText}</p>`;
            chatBox.appendChild(userMessage);
            chatBox.scrollTop = chatBox.scrollHeight;

            // Agregar el spinner de carga
            const loadingMessage = document.createElement('div');
            loadingMessage.classList.add('message', 'bot');
            loadingMessage.innerHTML = `<img src="Ferridescuentos.png" alt="Bot"><div class="spinner"></div>`;
            chatBox.appendChild(loadingMessage);
            chatBox.scrollTop = chatBox.scrollHeight;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            const prompt = `${conversationHistory}\n\nUsuario: ${inputText}\nAsistente:`;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                let responseText = await response.text();

                // Preprocesar la respuesta para manejar los asteriscos
                responseText = preprocessResponse(responseText);

                // Remover el spinner de carga
                chatBox.removeChild(loadingMessage);

                // Agregar la respuesta del bot al chat
                const botMessage = document.createElement('div');
                botMessage.classList.add('message', 'bot');
                botMessage.innerHTML = `<img src="Ferridescuentos.png" alt="Bot"><p>${responseText}</p>`;
                chatBox.appendChild(botMessage);
                chatBox.scrollTop = chatBox.scrollHeight;

                // Actualizar el historial de la conversación
                conversationHistory += `\n\nUsuario: ${inputText}\nAsistente: ${responseText}`;

                // Limpiar el campo de entrada
                document.getElementById('inputText').value = '';
            } catch (error) {
                console.error('Error al generar contenido:', error);
                chatBox.removeChild(loadingMessage);
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('message', 'bot');
                errorMessage.innerHTML = `<img src="Ferridescuentos.png" alt="Bot"><p>Error al generar contenido.</p>`;
                chatBox.appendChild(errorMessage);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        };

        const initializeChat = () => {
            const chatBox = document.getElementById('chatBox');
            const initialBotMessage = document.createElement('div');
            initialBotMessage.classList.add('message', 'bot');
            initialBotMessage.innerHTML = `<img src="Ferridescuentos.png" alt="Bot"><p>Hola, soy tu asistente virtual, puedes preguntarme cualquier duda que tengas relacionado a Ferridescuentos, el sistema "Salarix" o las políticas de nómina de nuestra empresa.</p>`;
            chatBox.appendChild(initialBotMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        document.getElementById('sendButton').addEventListener('click', sendMessage);

        document.getElementById('inputText').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });

        window.onload = () => {
            loadRules();
            initializeChat();
        };