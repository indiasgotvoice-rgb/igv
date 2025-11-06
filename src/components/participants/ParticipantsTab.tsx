import { Mic2, CheckCircle, FileText, Send, Award, HelpCircle } from 'lucide-react';

export default function ParticipantsTab() {
  const participationSteps = [
    {
      step: 1,
      title: 'Register as a Participant',
      description: 'Create your account and select "Participate" during sign-up. Your profile will be created with participant access.',
      icon: FileText,
      color: 'bg-blue-600',
    },
    {
      step: 2,
      title: 'Apply for a Show',
      description: 'Browse upcoming shows and submit your application. Include your stage name, a short bio, and upload a voice clip showcasing your talent (max 2 minutes).',
      icon: Send,
      color: 'bg-orange-600',
    },
    {
      step: 3,
      title: 'Wait for Approval',
      description: 'Our admin team will review your application. You\'ll be notified via email once your application is approved or if we need more information.',
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      step: 4,
      title: 'Perform Live',
      description: 'Once approved, you\'ll be scheduled to perform in the live show. Viewers will watch and vote for your performance in real-time!',
      icon: Mic2,
      color: 'bg-red-600',
    },
    {
      step: 5,
      title: 'Win & Get Recognized',
      description: 'Top performers with the most votes will be featured on our winners page and may get special opportunities for future shows!',
      icon: Award,
      color: 'bg-yellow-600',
    },
  ];

  const eligibilityRules = [
    'Must be 16 years or older to participate',
    'Voice clip should be original content or properly credited covers',
    'Maximum voice clip duration: 2 minutes',
    'No offensive or inappropriate content',
    'One application per person per show',
    'Must be available at the scheduled show time',
  ];

  const faqs = [
    {
      question: 'What format should my voice clip be?',
      answer: 'We accept MP3, WAV, or M4A formats. Maximum file size is 10MB.',
    },
    {
      question: 'How long does approval take?',
      answer: 'Applications are typically reviewed within 2-3 business days before the show date.',
    },
    {
      question: 'Can I apply for multiple shows?',
      answer: 'Yes! You can apply for as many upcoming shows as you like, but each requires a separate application.',
    },
    {
      question: 'What happens if I win?',
      answer: 'Winners are featured on our platform and may receive invitations to special shows and events.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <Mic2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Want to Perform on India's Got Voice?</h2>
            <p className="text-white/90 text-lg">
              Showcase your talent to thousands of viewers and compete for the top spot!
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-6">
          <p className="text-white/90">
            India's Got Voice is an online platform where talented singers can perform live,
            get instant feedback from viewers, and build their fanbase. Join our community of
            performers and let your voice be heard!
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-600" />
          How to Participate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`${step.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {step.step}
                  </div>
                  <Icon className={`w-8 h-8 ${step.color.replace('bg-', 'text-')}`} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Eligibility & Rules
          </h3>
          <ul className="space-y-3">
            {eligibilityRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Check out the "Shows" tab to see upcoming shows and submit your application.
          Make sure you're logged in as a participant to apply!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Send className="w-4 h-4" />
            <span>Email: support@indiasgotvoice.com</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <HelpCircle className="w-4 h-4" />
            <span>Need help? Contact us anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
