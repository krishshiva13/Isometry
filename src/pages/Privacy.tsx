import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Mail } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
      <div className="py-12 border-b border-black/5 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-sage text-white">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-black text-ink">Privacy Policy</h1>
              <p className="text-ink3">Last updated: January 1, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 prose prose-slate max-w-none">
        <p className="text-lg text-ink2 leading-relaxed">
          At FActHub, accessible from facthub.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by FActHub and how we use it.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">1. Information We Collect</h2>
        <p className="text-ink2">
          FActHub follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">2. Cookies and Web Beacons</h2>
        <p className="text-ink2">
          Like any other website, FActHub uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">3. Google DoubleClick DART Cookie</h2>
        <p className="text-ink2">
          Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-gold font-bold">https://policies.google.com/technologies/ads</a>
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">4. Advertising Partners Privacy Policies</h2>
        <p className="text-ink2">
          Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on FActHub, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">5. Third Party Privacy Policies</h2>
        <p className="text-ink2">
          FActHub's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">6. Children's Information</h2>
        <p className="text-ink2">
          Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          FActHub does not knowingly collect any Personal Identifiable Information from children under the age of 13.
        </p>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">7. Affiliate & Commercial Disclosure (Google & FTC Compliance)</h2>
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200/60 space-y-3">
          <p className="text-ink2 leading-relaxed m-0 text-sm">
            FActHub participates in affiliate marketing programs, including the <strong>Amazon Services LLC Associates Program</strong> and related educational publisher affiliate programs. This means we may earn a small referral commission on qualifying purchases made through our external links, at <strong>absolutely zero additional cost to you</strong>.
          </p>
          <p className="text-ink2 leading-relaxed m-0 text-sm">
            In compliance with Google Webmaster Guidelines and Federal Trade Commission (FTC) requirements, all affiliate and commercial partner links on our website are explicitly tagged with <code className="bg-white px-1.5 py-0.5 rounded text-ink font-mono text-xs border border-black/10">rel="nofollow sponsored"</code> attributes. We maintain editorial independence and only recommend books, scientific literature, and historical resources that enrich our readers' educational experience.
          </p>
        </div>

        <h2 className="text-2xl font-serif font-bold text-ink mt-12 mb-4">8. Contact Us</h2>
        <div className="bg-paper2 p-8 rounded-2xl border border-black/5 mt-8">
          <p className="text-ink2 leading-relaxed mb-0">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <span className="font-bold text-gold">admin@facthub.in</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
