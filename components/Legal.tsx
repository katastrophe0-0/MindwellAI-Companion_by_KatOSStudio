
import React, { useState } from 'react';
import { AppView } from '../types';
import { Shield, FileText, ArrowLeft, Scale, AlertTriangle, Lock, Copyright, MapPin, Gavel } from 'lucide-react';

interface LegalProps {
    setActiveView: (view: AppView) => void;
}

const Legal: React.FC<LegalProps> = ({ setActiveView }) => {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
                <button onClick={() => setActiveView(AppView.Settings)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    Legal Information
                </h2>
            </div>
            
            <div className="flex border-b border-slate-200 bg-white">
                <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`flex-1 p-4 font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Shield className="w-4 h-4" /> Privacy Policy
                </button>
                <button 
                    onClick={() => setActiveTab('terms')}
                    className={`flex-1 p-4 font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'terms' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <FileText className="w-4 h-4" /> Terms of Service
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                   
                   {activeTab === 'privacy' ? (
                       <div className="prose prose-slate max-w-none text-sm text-slate-700">
                           <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
                               <Lock className="w-6 h-6 mr-2 text-indigo-500"/> Privacy Policy
                           </h3>
                           <p className="italic text-slate-500 mb-6">Last Updated: October 26, 2023</p>

                           <p>
                               MindWell AI Companion ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the MindWell application (the "App") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                           </p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">1. Information We Collect</h4>
                           <ul className="list-disc pl-5 space-y-1">
                               <li><strong>Personal Information:</strong> We collect information by which you may be personally identified, such as your name, birth details (date, time, location for astrology features), and contact preferences.</li>
                               <li><strong>Sensitive Information:</strong> We collect health and wellness data you voluntarily provide, including mood logs, journal entries, menstrual cycle data, and responses to mental health assessments.</li>
                               <li><strong>Device Information:</strong> We may access your microphone (for voice features) and geolocation (for local resource finding), but only with your explicit permission.</li>
                               <li><strong>Usage Data:</strong> We collect anonymous data about how you access and use the App to improve functionality.</li>
                           </ul>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">2. How We Use Your Information</h4>
                           <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
                           <ul className="list-disc pl-5 space-y-1">
                               <li>To present our App and its contents to you.</li>
                               <li>To provide you with information, products, or services that you request from us.</li>
                               <li>To fulfill the purposes of the App features (e.g., generating horoscopes, analyzing journal entries via AI).</li>
                               <li>To notify you about changes to our App or any products or services we offer or provide though it.</li>
                           </ul>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">3. Local-First Data Storage</h4>
                           <p className="font-semibold text-indigo-700">Your privacy is our priority. MindWell is designed with a "Local First" architecture.</p>
                           <ul className="list-disc pl-5 space-y-1 mt-2">
                               <li><strong>Device Storage:</strong> Your sensitive journal entries, mood logs, and personal profile settings are stored primarily on your device's local storage mechanism (LocalStorage). We do not automatically upload this data to a central cloud database without your explicit action (e.g., using the Cloud Backup feature).</li>
                               <li><strong>Data Persistence:</strong> Because data is stored locally, clearing your browser cache or uninstalling the App may result in data loss unless you have performed a backup.</li>
                           </ul>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">4. AI Processing & Third Parties</h4>
                           <p>To provide intelligent features, we utilize third-party API services, specifically Google Gemini (Google Cloud).</p>
                           <ul className="list-disc pl-5 space-y-1 mt-2">
                               <li><strong>Data Transmission:</strong> When you use features like the Chatbot, Journal Analysis, or Thought Reframer, the text or audio input you provide is transmitted securely to Google's servers for processing.</li>
                               <li><strong>No Sale of Data:</strong> We do not sell, trade, or rent your personal identification information to others.</li>
                               <li><strong>Service Providers:</strong> We may disclose aggregated, non-personal information about our users without restriction. We may disclose personal information to contractors, service providers, and other third parties we use to support our business.</li>
                           </ul>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">5. Data Security</h4>
                           <p>We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted to our App.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">6. Children Under the Age of 13</h4>
                           <p>Our App is not intended for children under 13 years of age. No one under age 13 may provide any information to or on the App. We do not knowingly collect personal information from children under 13. If you are under 13, do not use or provide any information on this App.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">7. California Privacy Rights</h4>
                           <p>If you are a California resident, California law may provide you with additional rights regarding our use of your personal information. To learn more about your California privacy rights, visit the CCPA privacy notice.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">8. Contact Information</h4>
                           <p>To ask questions or comment about this privacy policy and our privacy practices, contact us via the support channels within the application.</p>
                       </div>
                   ) : (
                       <div className="prose prose-slate max-w-none text-sm text-slate-700">
                           <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
                               <Gavel className="w-6 h-6 mr-2 text-slate-700"/> Terms of Service
                           </h3>
                           <p className="italic text-slate-500 mb-6">Last Updated: October 26, 2023</p>

                           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                               <h4 className="text-red-800 font-bold flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> MEDICAL DISCLAIMER - IMPORTANT</h4>
                               <p className="text-red-700 text-sm mt-1">
                                   MindWell AI Companion is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment. The content provided by this App, including AI-generated responses, is for informational, self-help, and psychoeducational purposes only. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. <strong>If you are in crisis or believe you may have a medical emergency, call 911 or your local emergency number immediately.</strong>
                               </p>
                           </div>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">1. Acceptance of the Terms of Use</h4>
                           <p>These terms of use are entered into by and between You and MindWell AI Companion, owned and operated by KatOSStudio ("Company," "we," or "us"). The following terms and conditions govern your access to and use of the MindWell application.</p>
                           <p className="mt-2">By using the App, you accept and agree to be bound and abide by these Terms of Use and our Privacy Policy. If you do not want to agree to these Terms of Use or the Privacy Policy, you must not access or use the App.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">2. Governing Law and Jurisdiction</h4>
                           <p>All matters relating to the App and these Terms of Use, and any dispute or claim arising therefrom or related thereto (in each case, including non-contractual disputes or claims), shall be governed by and construed in accordance with the internal laws of the <strong>State of Wisconsin</strong> without giving effect to any choice or conflict of law provision or rule (whether of the State of Wisconsin or any other jurisdiction).</p>
                           <p className="mt-2">Any legal suit, action, or proceeding arising out of, or related to, these Terms of Use or the App shall be instituted exclusively in the federal courts of the United States or the courts of the <strong>State of Wisconsin</strong>. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">3. Accessing the App and Account Security</h4>
                           <p>We reserve the right to withdraw or amend this App, and any service or material we provide on the App, in our sole discretion without notice. We will not be liable if for any reason all or any part of the App is unavailable at any time or for any period.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">4. Intellectual Property Rights</h4>
                           <p>The App and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by the Company, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">5. Prohibited Uses</h4>
                           <p>You may use the App only for lawful purposes and in accordance with these Terms of Use. You agree not to use the App:</p>
                           <ul className="list-disc pl-5 space-y-1">
                               <li>In any way that violates any applicable federal, state, local, or international law or regulation (including, without limitation, any laws regarding the export of data or software to and from the US or other countries).</li>
                               <li>To exploit, harm, or attempt to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information, or otherwise.</li>
                               <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
                           </ul>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">6. Subscription Services</h4>
                           <p>The App offers various subscription tiers ("Spark", "Glow", "Radiance") that grant access to premium features. Fees for these services are billed on a recurring basis. You may cancel your subscription at any time, but we do not provide refunds for partial subscription periods. We reserve the right to modify our pricing at any time, with notice provided to you.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">7. Disclaimer of Warranties</h4>
                           <p className="uppercase text-xs font-bold text-slate-500">READ CAREFULLY</p>
                           <p className="mt-1">YOUR USE OF THE APP, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP IS AT YOUR OWN RISK. THE APP, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER THE COMPANY NOR ANY PERSON ASSOCIATED WITH THE COMPANY MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE APP.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">8. Limitation of Liability</h4>
                           <p className="uppercase text-xs font-bold text-slate-500">READ CAREFULLY</p>
                           <p className="mt-1">TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL THE COMPANY, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE APP, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">9. Indemnification</h4>
                           <p>You agree to defend, indemnify, and hold harmless the Company, its affiliates, licensors, and service providers, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Use or your use of the App.</p>

                           <h4 className="font-bold text-lg text-slate-900 mt-6 mb-2">10. Arbitration</h4>
                           <p>At Company's sole discretion, it may require You to submit any disputes arising from the use of these Terms of Use or the App, including disputes arising from or concerning their interpretation, violation, invalidity, non-performance, or termination, to final and binding arbitration under the Rules of Arbitration of the American Arbitration Association applying <strong>Wisconsin law</strong>.</p>

                           <div className="mt-10 p-6 bg-slate-100 rounded-lg border border-slate-300">
                               <h4 className="font-bold text-lg text-slate-900 mb-3 flex items-center">
                                   <Copyright className="w-5 h-5 mr-2"/> Copyright & Ownership
                               </h4>
                               <p className="text-slate-800 font-semibold mb-2">
                                   © {new Date().getFullYear()} KatOSStudio. All Rights Reserved.
                               </p>
                               <div className="flex items-center gap-2 text-slate-700 mb-2 text-sm">
                                   <MapPin className="w-4 h-4"/>
                                   <span>Proudly created in Wisconsin, USA.</span>
                               </div>
                               <p className="text-slate-600 text-xs leading-relaxed">
                                   No part of this application, including its unique AI prompts, UI design, codebase, or branding, may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the owner, Katelynn Przybilla.
                               </p>
                           </div>
                       </div>
                   )}

                </div>
            </div>
        </div>
    )
}

export default Legal;
