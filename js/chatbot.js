/**
 * Global Horizons Travel Chatbot 
 * Complete Journey Planner (Ticket -> Destination -> Full Budget Plan)
 * 
 * CHATBOT TRAINING RULE:
 * If a connecting city or airport is required:
 * - Use it internally for calculation and planning
 * - Do NOT display the intermediate city or airport name to the user
 * - Use generic terms like: "Nearest International Airport", "Connecting Domestic Transfer", "Connecting Flight Included"
 */

const cityAirportMap = {
    "Kolhapur": { hasInternational: false, nearestInternational: "Mumbai", domesticMode: "Domestic transfer to international airport included" },
    "Pune": { hasInternational: true, nearestInternational: "Pune", domesticMode: "Direct" },
    "Mumbai": { hasInternational: true, nearestInternational: "Mumbai", domesticMode: "Direct" },
    "Delhi": { hasInternational: true, nearestInternational: "Delhi", domesticMode: "Direct" },
    "Bangalore": { hasInternational: true, nearestInternational: "Bangalore", domesticMode: "Direct" },
    "Chennai": { hasInternational: true, nearestInternational: "Chennai", domesticMode: "Direct" },
    "Satara": { hasInternational: false, nearestInternational: "Mumbai", domesticMode: "Express Train transfer included" },
    "Nashik": { hasInternational: false, nearestInternational: "Mumbai", domesticMode: "Bus/Train transfer included" },
    "Sangli": { hasInternational: false, nearestInternational: "Mumbai", domesticMode: "Train transfer included" }
};

function isInternational(destination) {
    // Check against allDestinations if available, or simple string check
    if (typeof allDestinations !== 'undefined') {
        const dest = allDestinations.find(d => d.name.toLowerCase().includes(destination.toLowerCase()));
        return dest ? dest.category === "International" : false;
    }
    return false; // Default to domestic if unknown
}

class TravelChatbot {
    constructor() {
        this.isOpen = false;
        this.currentState = 'START';
        this.userData = {
            from: '',
            destination: '',
            budget: 0,
            people: 0,
            days: 0
        };

        this.ticketRules = {
            "Budget": "Train (Sleeper / 3A) – Return ticket included",
            "Semi-Luxury": "Train (2A) / Flight (Economy) – Return included",
            "Luxury": "Flight (Economy / Business) – Return included"
        };

        this.hotelRules = {
            "Budget": { hotel: "2★ Hotel / Lodge", meals: "Breakfast only" },
            "Semi-Luxury": { hotel: "3★ Hotel", meals: "Breakfast + Dinner" },
            "Luxury": { hotel: "4★ / 5★ Hotel", meals: "All meals included" }
        };

        this.init();
    }

    init() {
        this.renderElements();
        this.addEventListeners();
        setTimeout(() => this.showBotMessage("Hello! I'm your GHT Travel Assistant. I'll help you plan your ENTIRE journey including tickets, hotels, and sightseeing within your budget. Let's start! Where are you traveling from (City name)?"), 1000);
        this.currentState = 'ASK_FROM';
    }

    buildRoute(from, destination) {
        const cityData = cityAirportMap[from];
        const international = isInternational(destination);

        if (international && cityData && !cityData.hasInternational) {
            return {
                route: `${from} → Nearest International Airport → ${destination}`,
                explanation: `International connection required from nearest major airport.`,
                legs: [
                    {
                        from,
                        to: "Nearest International Airport",
                        mode: cityData.domesticMode
                    },
                    {
                        from: "Nearest International Airport",
                        to: destination,
                        mode: "International Flight"
                    }
                ]
            };
        }

        return {
            route: `${from} → ${destination}`,
            explanation: "",
            legs: [
                {
                    from,
                    to: destination,
                    mode: international ? "International Flight" : "Train / Flight"
                }
            ]
        };
    }

    renderElements() {
        // Create Launcher if not exists
        if (!document.getElementById('chatbot-launcher')) {
            const launcher = document.createElement('div');
            launcher.className = 'chatbot-launcher';
            launcher.id = 'chatbot-launcher';
            launcher.innerHTML = '<i class="fas fa-comments"></i>';
            document.body.appendChild(launcher);
        }

        // Create Window if not exists
        if (!document.getElementById('chatbot-window')) {
            const window = document.createElement('div');
            window.className = 'chatbot-window';
            window.id = 'chatbot-window';
            window.innerHTML = `
                <div class="chatbot-header">
                    <div class="info">
                        <img src="images/final_logo.png" alt="Bot">
                        <div>
                            <h4>GHT Travel Planner</h4>
                            <p>Online | Ticket & Budget Expert</p>
                        </div>
                    </div>
                    <div class="close-btn" id="chatbot-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <form class="chatbot-input-area" id="chatbot-form">
                    <input type="text" id="chatbot-input" placeholder="Type your message..." autocomplete="off">
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            `;
            document.body.appendChild(window);
        }
    }

    addEventListeners() {
        const launcher = document.getElementById('chatbot-launcher');
        const closeBtn = document.getElementById('chatbot-close');
        const form = document.getElementById('chatbot-form');
        const input = document.getElementById('chatbot-input');

        launcher.addEventListener('click', () => this.toggleWindow());
        closeBtn.addEventListener('click', () => this.toggleWindow());

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = input.value.trim();
            if (message) {
                this.handleUserInput(message);
                input.value = '';
            }
        });
    }

    toggleWindow() {
        const window = document.getElementById('chatbot-window');
        this.isOpen = !this.isOpen;
        window.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) {
            document.getElementById('chatbot-input').focus();
        }
    }

    showBotMessage(text) {
        const container = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerText = text;
        container.appendChild(msgDiv);
        this.scrollToBottom();
    }

    showUserMessage(text) {
        const container = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerText = text;
        container.appendChild(msgDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = document.getElementById('chatbot-messages');
        container.scrollTop = container.scrollHeight;
    }

    handleUserInput(input) {
        this.showUserMessage(input);

        setTimeout(() => {
            switch (this.currentState) {
                case 'ASK_FROM':
                    this.userData.from = input;
                    this.showBotMessage(`Great! Planning from ${input}. Which destination would you like to visit?`);
                    this.currentState = 'ASK_DESTINATION';
                    break;

                case 'ASK_DESTINATION':
                    this.userData.destination = input;
                    this.showBotMessage(`Understood! What is your total fixed budget for this entire trip in ₹?`);
                    this.currentState = 'ASK_BUDGET';
                    break;

                case 'ASK_BUDGET':
                    const budget = parseInt(input.replace(/[^0-9]/g, ''));
                    if (isNaN(budget) || budget <= 0) {
                        this.showBotMessage("Please enter a valid budget amount in ₹.");
                    } else {
                        this.userData.budget = budget;
                        this.showBotMessage(`Perfect. ₹${budget.toLocaleString()}. How many travelers in total?`);
                        this.currentState = 'ASK_PEOPLE';
                    }
                    break;

                case 'ASK_PEOPLE':
                    const people = parseInt(input);
                    if (isNaN(people) || people <= 0) {
                        this.showBotMessage("Please enter a valid number of travelers.");
                    } else {
                        this.userData.people = people;
                        this.showBotMessage(`And for how many days do you want the trip?`);
                        this.currentState = 'ASK_DAYS';
                    }
                    break;

                case 'ASK_DAYS':
                    const days = parseInt(input);
                    if (isNaN(days) || days <= 0) {
                        this.showBotMessage("Please enter a valid number of days.");
                    } else {
                        this.userData.days = days;
                        this.showBotMessage("Generating your complete journey plan (Tickets → Hotel → Sightseeing)...");
                        setTimeout(() => this.generateFullPlan(), 1500);
                    }
                    break;

                default:
                    if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('restart')) {
                        this.currentState = 'ASK_FROM';
                        this.showBotMessage("Let's plan another trip! Where are you traveling from?");
                    } else {
                        this.showBotMessage("Type 'yes' or 'restart' if you'd like to plan another travel package.");
                    }
                    break;
            }
        }, 800);
    }

    getType(budget, people, days) {
        const ppd = budget / people / days;
        if (ppd < 5000) return "Budget";
        if (ppd <= 10000) return "Semi-Luxury";
        return "Luxury";
    }

    budgetBreakup(total) {
        return {
            tickets: total * 0.35,
            hotel: total * 0.40,
            meals: total * 0.15,
            local: total * 0.10
        };
    }

    generateFullPlan() {
        const type = this.getType(this.userData.budget, this.userData.people, this.userData.days);
        const cost = this.budgetBreakup(this.userData.budget);
        const ticketInfo = this.ticketRules[type];
        const hotelInfo = this.hotelRules[type];

        let itineraryHTML = "";
        for (let d = 1; d <= this.userData.days; d++) {
            if (d === 1) {
                itineraryHTML += `<div style="margin-bottom:4px;">• <strong>Day 1:</strong> Depart from ${this.userData.from}, arrive at ${this.userData.destination}, hotel check-in.</div>`;
            } else if (d === this.userData.days) {
                itineraryHTML += `<div style="margin-bottom:4px;">• <strong>Day ${d}:</strong> Local exploration, checkout, and return journey journey.</div>`;
            } else {
                itineraryHTML += `<div style="margin-bottom:4px;">• <strong>Day ${d}:</strong> Signature local sightseeing and activities.</div>`;
            }
        }

        const routeInfo = this.buildRoute(this.userData.from, this.userData.destination);

        const resultHTML = `
            <div class="package-result" style="border-left: 4px solid var(--accent); background: white; padding: 1.2rem; border-radius: 12px; font-size: 0.85rem;">
                <h4 style="color: var(--primary); margin: 0 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 5px;">✨ ${type} Travel Package ✨</h4>
                
                <p>📍 <strong>Route:</strong> ${routeInfo.route}<br>
                👥 <strong>Travelers:</strong> ${this.userData.people} | 📅 <strong>Duration:</strong> ${this.userData.days} Days</p>

                <div style="margin: 10px 0;">
                    <strong>🎟 Travel Tickets:</strong><br>
                    <span style="color: #555;">
                        ${routeInfo.legs.map(leg => `• ${leg.mode}`).join('<br>')}
                        <br>• Return ticket included
                    </span>
                </div>

                <div style="margin: 10px 0;">
                    <strong>🏨 Hotel & Stay:</strong><br>
                    <span style="color: #555;">${hotelInfo.hotel} (${this.userData.days - 1} Nights in premium area)</span>
                </div>

                <div style="margin: 10px 0;">
                    <strong>🍽 Meals Plan:</strong><br>
                    <span style="color: #555;">${hotelInfo.meals}</span>
                </div>

                <div style="margin: 10px 0;">
                    <strong>🗺 Day-wise Itinerary:</strong><br>
                    <div style="font-size: 0.75rem; color: #555; margin-top: 5px;">${itineraryHTML}</div>
                </div>

                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                    <strong style="display: block; margin-bottom: 5px; color: var(--primary);">💰 Budget Breakup (Estimates):</strong>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Travel Tickets:</span> <strong>₹${Math.round(cost.tickets).toLocaleString()}</strong></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Hotel Stay:</span> <strong>₹${Math.round(cost.hotel).toLocaleString()}</strong></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Meals:</span> <strong>₹${Math.round(cost.meals).toLocaleString()}</strong></div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px dashed #ccc; padding-top: 5px;"><span>Local & Sightseeing:</span> <strong>₹${Math.round(cost.local).toLocaleString()}</strong></div>
                </div>

                <p style="color: #2b9348; font-weight: 700; text-align: center; margin-top: 10px; font-size: 0.9rem;">
                    ✅ All connections managed smoothly<br>
                    <span style="font-size: 0.7rem; font-weight: normal;">Budget Fully Respected: ₹${this.userData.budget.toLocaleString()}</span>
                </p>
            </div>
        `;

        const container = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = resultHTML;
        container.appendChild(msgDiv);
        this.scrollToBottom();

        setTimeout(() => {
            this.showBotMessage("Your full journey is planned! Would you like to build another customized trip plan? (Type 'yes' to restart)");
            this.currentState = 'DONE';
        }, 1000);
    }
}

// Initialize Chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Single instance check
    if (!window.travelChatbot) {
        window.travelChatbot = new TravelChatbot();
    }
});
