import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

import {
  Cpu, Save, RotateCcw, Zap, Shield, MessageSquare,
  Sliders, Bot, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableSafetyFilters: boolean;
  enableFallback: boolean;
  emergencyKeywords: string;
  responseLanguage: string;
  confidenceThreshold: number;
  classificationMode: string;
}

const defaultConfig: AIConfig = {
  model: 'gemini-1.5-pro',
  temperature: 0.3,
  maxTokens: 1024,
  systemPrompt: `You are an AI Emergency Assistant specialized in crisis management. Your role is to:
1. Quickly assess emergency situations based on user descriptions
2. Classify incident type (medical, fire, police, accident, natural, suspicious)
3. Provide clear, actionable safety instructions
4. Recommend immediate response actions
5. Maintain calm and authoritative tone during all emergency interactions

Always prioritize human safety. If unsure, default to the most protective course of action.`,
  enableSafetyFilters: true,
  enableFallback: true,
  emergencyKeywords: 'fire, flood, earthquake, accident, medical, police, robbery, attack, gas leak, explosion',
  responseLanguage: 'en',
  confidenceThreshold: 0.7,
  classificationMode: 'rule-based',
};

const AdminAIConfig = () => {
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, this would call an API endpoint to persist AI settings
    toast.success('AI configuration saved successfully');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast('Configuration reset to defaults', { icon: '↺' });
  };

  const update = (key: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const modelOptions = [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'Google', tier: 'Production' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Google', tier: 'Fast' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', tier: 'Production' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', tier: 'Fast' },
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'Production' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic', tier: 'Fast' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-500" />
            AI Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Control the behavior of the AI Emergency Assistant for all users.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleSave} className={`gap-2 transition-all ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Selection */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-purple-500" />
              Language Model
            </CardTitle>
            <CardDescription>Select the underlying AI model for emergency classification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modelOptions.map(m => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.01 }}
                onClick={() => update('model', m.value)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  config.model === m.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      m.tier === 'Fast'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {m.tier}
                    </span>
                    {config.model === m.value && (
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Parameters */}
        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sliders className="h-5 w-5 text-blue-500" />
                Model Parameters
              </CardTitle>
              <CardDescription>Tune response behavior and quality settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{config.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={config.temperature}
                  onChange={e => update('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Precise (0)</span><span>Balanced (0.5)</span><span>Creative (1)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Max Tokens (Response Length)</label>
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{config.maxTokens}</span>
                </div>
                <input
                  type="range" min="256" max="4096" step="128"
                  value={config.maxTokens}
                  onChange={e => update('maxTokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>256</span><span>2048</span><span>4096</span>
                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Classification Confidence Threshold</label>
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{Math.round(config.confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range" min="0.4" max="0.99" step="0.01"
                  value={config.confidenceThreshold}
                  onChange={e => update('confidenceThreshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Permissive (40%)</span><span>Strict (99%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification Mode */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-yellow-500" />
                Classification Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { value: 'rule-based', label: 'Rule-Based', desc: 'Fast keyword pattern matching — deterministic and offline.', icon: Zap },
                { value: 'ml-hybrid', label: 'ML Hybrid', desc: 'Combines rules with ML scoring for higher accuracy.', icon: Cpu },
                { value: 'llm-only', label: 'LLM Only', desc: 'Full reasoning through selected language model. Slowest but most accurate.', icon: Bot },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('classificationMode', opt.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    config.classificationMode === opt.value
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <opt.icon className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                    </div>
                    {config.classificationMode === opt.value && (
                      <CheckCircle2 className="h-4 w-4 text-yellow-500 ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Prompt */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-green-500" />
              System Prompt (Instructions to AI)
            </CardTitle>
            <CardDescription>This prompt is prepended to every conversation to guide the AI's behavior. Changing this affects all user interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={config.systemPrompt}
              onChange={e => update('systemPrompt', e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              {config.systemPrompt.split(' ').length} words — approximately {Math.ceil(config.systemPrompt.length / 4)} tokens
            </p>
          </CardContent>
        </Card>

        {/* Safety & Features */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-red-500" />
              Safety & Behavior Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'enableSafetyFilters' as keyof AIConfig, label: 'Enable Content Safety Filters', desc: 'Block harmful or inappropriate responses using model safety layers.' },
              { key: 'enableFallback' as keyof AIConfig, label: 'Enable Fallback Response Mode', desc: 'Return a default safe response if classification confidence is below threshold.' },
            ].map(item => (
              <div key={item.key} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => update(item.key, !config[item.key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${config[item.key] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${config[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Language & Keywords */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-orange-500" />
              Response & Detection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Language</label>
              <select
                value={config.responseLanguage}
                onChange={e => update('responseLanguage', e.target.value)}
                className="w-full flex h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="auto">Auto-detect from user</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Emergency Keywords</label>
              <textarea
                value={config.emergencyKeywords}
                onChange={e => update('emergencyKeywords', e.target.value)}
                rows={4}
                placeholder="Comma-separated keywords that trigger emergency classification…"
                className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-400">
                {config.emergencyKeywords.split(',').filter(k => k.trim()).length} keywords configured
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-purple-700 dark:text-purple-300">
            <AlertTriangle className="h-5 w-5" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Model', value: config.model },
              { label: 'Temperature', value: config.temperature.toFixed(2) },
              { label: 'Max Tokens', value: config.maxTokens.toLocaleString() },
              { label: 'Classification', value: config.classificationMode },
              { label: 'Language', value: config.responseLanguage.toUpperCase() },
              { label: 'Confidence', value: `${Math.round(config.confidenceThreshold * 100)}%` },
              { label: 'Safety Filters', value: config.enableSafetyFilters ? 'ON' : 'OFF' },
              { label: 'Fallback Mode', value: config.enableFallback ? 'ON' : 'OFF' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{item.label}</p>
                <p className="font-semibold text-purple-800 dark:text-purple-200 font-mono text-xs mt-0.5 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIConfig;
