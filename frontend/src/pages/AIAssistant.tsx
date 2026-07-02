import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, Send, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

type IncidentType = 'medical' | 'fire' | 'police' | 'accident' | 'natural' | 'suspicious';

interface AIAssessment {
  type: IncidentType;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityScore: number;
  suggestedActions: string[];
  safetyInstructions: string[];
  riskAssessment: string;
}

const suggestedPrompts = [
  "Someone is having a heart attack",
  "There's a fire in the building",
  "Car accident on Main Street",
  "Flooding in the neighborhood",
  "Suspicious person nearby"
];

const emergencyResponses: Record<IncidentType, AIAssessment> = {
  medical: {
    type: 'medical',
    label: 'Medical Emergency',
    severity: 'critical',
    severityScore: 95,
    suggestedActions: [
      "Call emergency medical services immediately",
      "Check if the person is breathing",
      "Perform CPR if trained",
      "Do not move the person unless necessary"
    ],
    safetyInstructions: [
      "Stay calm and reassure the person",
      "Loosen tight clothing around neck/chest",
      "Keep them warm if they are cold",
      "Monitor vital signs until help arrives"
    ],
    riskAssessment: "High risk of life-threatening complications. Immediate medical attention required."
  },
  fire: {
    type: 'fire',
    label: 'Fire Emergency',
    severity: 'critical',
    severityScore: 98,
    suggestedActions: [
      "Pull fire alarm immediately",
      "Evacuate the building via nearest exit",
      "Do not use elevators",
      "Stay low to avoid smoke inhalation"
    ],
    safetyInstructions: [
      "Feel door handles before opening - if hot, find another exit",
      "Close doors behind you to slow fire spread",
      "If trapped, call emergency services and signal for help",
      "Once outside, stay at safe distance from the building"
    ],
    riskAssessment: "Extreme risk of injury or death. Immediate evacuation and emergency response required."
  },
  police: {
    type: 'police',
    label: 'Crime Incident',
    severity: 'high',
    severityScore: 75,
    suggestedActions: [
      "Ensure your personal safety first",
      "Call police emergency number",
      "Do not confront the suspect",
      "Find a safe location to observe"
    ],
    safetyInstructions: [
      "Stay calm and do not make sudden movements",
      "Remember important details (description, vehicle, direction)",
      "Avoid touching anything that might be evidence",
      "Cooperate fully with police when they arrive"
    ],
    riskAssessment: "High risk of harm. Ensure personal safety before taking any other action."
  },
  accident: {
    type: 'accident',
    label: 'Road Accident',
    severity: 'high',
    severityScore: 80,
    suggestedActions: [
      "Turn on hazard lights",
      "Check for injuries",
      "Move to a safe location if possible",
      "Call emergency services"
    ],
    safetyInstructions: [
      "Do not move injured people unless in immediate danger",
      "Use warning triangles to alert other drivers",
      "Exchange information with other drivers",
      "Take photos of the scene if safe"
    ],
    riskAssessment: "Risk of further accidents and injuries. Secure the scene immediately."
  },
  natural: {
    type: 'natural',
    label: 'Natural Disaster',
    severity: 'critical',
    severityScore: 90,
    suggestedActions: [
      "Follow local emergency alerts",
      "Move to designated safe shelter",
      "Secure loose objects that could become projectiles",
      "Stay tuned to emergency broadcasts"
    ],
    safetyInstructions: [
      "Have emergency kit ready (water, food, first aid)",
      "Know evacuation routes beforehand",
      "Avoid low-lying areas during floods",
      "Stay away from windows during storms"
    ],
    riskAssessment: "Severe risk of widespread damage and injury. Follow official guidance immediately."
  },
  suspicious: {
    type: 'suspicious',
    label: 'Suspicious Activity',
    severity: 'medium',
    severityScore: 50,
    suggestedActions: [
      "Observe from a safe distance",
      "Note suspicious details",
      "Report to authorities",
      "Do not approach or confront"
    ],
    safetyInstructions: [
      "Trust your instincts",
      "Do not reveal that you are observing",
      "Record details (time, location, description)",
      "Alert security or police when safe"
    ],
    riskAssessment: "Potential risk. Monitor situation and report if necessary."
  }
};

const classifyIncident = (message: string): IncidentType => {
  const lower = message.toLowerCase();
  if (lower.includes('heart') || lower.includes('medical') || lower.includes('health') || lower.includes('attack')) return 'medical';
  if (lower.includes('fire') || lower.includes('burn') || lower.includes('smoke')) return 'fire';
  if (lower.includes('police') || lower.includes('crime') || lower.includes('theft') || lower.includes('robbery')) return 'police';
  if (lower.includes('accident') || lower.includes('crash') || lower.includes('car') || lower.includes('collision')) return 'accident';
  if (lower.includes('flood') || lower.includes('storm') || lower.includes('earthquake') || lower.includes('tornado') || lower.includes('hurricane')) return 'natural';
  if (lower.includes('suspicious') || lower.includes('strange') || lower.includes('weird')) return 'suspicious';
  return 'medical';
};

const AIAssistant = () => {
  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
    assessment?: AIAssessment;
  }[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Emergency Assistant. Describe what's happening and I'll help assess the situation and guide you."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = async (userInput: string) => {
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const incidentType = classifyIncident(userInput);
    const assessment = emergencyResponses[incidentType];

    const responseMessage = `I've assessed your situation as a ${assessment.label}.\n\nSeverity Level: ${assessment.severity.toUpperCase()}\n\n${assessment.riskAssessment}`;

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: responseMessage, assessment }
    ]);

    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    await getResponse(input);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="mr-2 h-8 w-8 text-blue-600" />
            AI Emergency Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Get instant guidance for emergency situations (SIMULATED)</p>
        </motion.div>

        {/* Suggested Prompts */}
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setInput(prompt)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-4 space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-center mb-1">
                  {msg.role === 'assistant' && <Bot className="h-4 w-4 mr-2" />}
                  <span className="text-xs font-medium opacity-75">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* AI Assessment Card */}
                {msg.assessment && (
                  <Card className={`mt-4 border-l-4 ${getSeverityColor(msg.assessment.severity)}`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {msg.assessment.severity === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {msg.assessment.severity === 'high' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        Incident Assessment: {msg.assessment.label}
                      </CardTitle>
                      <CardDescription>Severity Score: {msg.assessment.severityScore}/100</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Suggested Actions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {msg.assessment.suggestedActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 mt-1 flex-shrink-0 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Safety Instructions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {msg.assessment.safetyInstructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                <span className="text-sm">Typing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Button variant="secondary" size="icon">
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe the emergency..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
