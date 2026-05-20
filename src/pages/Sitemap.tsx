import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';

export const Sitemap = () => {
    const sections = [
        {
          title: "Main Categories",
          links: [
            { name: "History", path: "/category/history" },
            { name: "Science", path: "/category/science" },
            { name: "Inventions", path: "/category/inventions" },
            { name: "Discoveries", path: "/category/discoveries" },
            { name: "Birthdays", path: "/birthdays" },
          ]
        },
        {
          title: "Activities",
          links: [
            { name: "Daily Quiz", path: "/quiz" },
            { name: "Popular Facts", path: "/" },
            { name: "Fact of the Day", path: "/" },
          ]
        },
        {
          title: "Legal & Info",
          links: [
            { name: "About Us", path: "/about" },
            { name: "Contact Us", path: "/contact" },
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Advertise", path: "/advertise" },
          ]
        }
    ];

  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
      <div className="py-12 border-b border-black/5 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-lg bg-indigo text-white">
                <Map size={32} />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink">Sitemap</h1>
                <p className="text-ink3 text-sm sm:text-base">A complete map of our curious universe</p>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {sections.map(sec => (
                <div key={sec.title} className="space-y-6">
                    <h2 className="text-xl font-serif font-bold text-ink border-b border-black/10 pb-4">{sec.title}</h2>
                    <ul className="space-y-4">
                        {sec.links.map(link => (
                            <li key={link.name}>
                                <Link to={link.path} className="text-ink2 hover:text-gold transition-colors block py-1">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};
