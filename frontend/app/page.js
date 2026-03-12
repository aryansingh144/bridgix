'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const events = [
  {
    id: 1,
    title: 'Annual Alumni Meetup 2026',
    date: 'March 28, 2026',
    location: 'Le Meridien, New Delhi',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    category: 'Alumni Meet'
  },
  {
    id: 2,
    title: 'Tech Seminar: Future of AI in India',
    date: 'April 5, 2026',
    location: 'Online (Zoom)',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    category: 'Seminar'
  },
  {
    id: 3,
    title: 'International Conference on CS & IT',
    date: 'April 15, 2026',
    location: 'IIT Delhi Auditorium',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    category: 'Conference'
  }
];

const coreValues = [
  { icon: '⚖️', title: 'Integrity', desc: 'We uphold honesty and transparency in every interaction between alumni and students.' },
  { icon: '🎓', title: 'Mentorship', desc: 'Connecting experienced alumni with aspiring students to guide their career journeys.' },
  { icon: '💻', title: 'Webinars', desc: 'Regular online sessions covering industry trends, skills, and career opportunities.' },
  { icon: '🏆', title: 'Placement Assistance', desc: 'Dedicated support to help students secure their dream roles in top companies.' },
  { icon: '🚀', title: 'Career Guidance', desc: 'Personalized roadmaps to help students navigate their professional paths effectively.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Microsoft',
    text: 'Bridgix connected me with an alumni mentor who helped me crack my Google interview. The guidance I received was invaluable and went beyond what any coaching class could offer.',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=2BC0B4&color=fff'
  },
  {
    name: 'Arjun Mehta',
    role: 'Data Scientist, Razorpay',
    text: 'Through Bridgix webinars, I learned about real-world data science workflows that my college curriculum never covered. It truly bridges the gap between academia and industry.',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=FF8C42&color=fff'
  },
  {
    name: 'Neha Gupta',
    role: 'Product Manager, Flipkart',
    text: 'The alumni network on Bridgix is incredible. I found my first internship through a connection I made here, and that experience changed my entire career trajectory.',
    rating: 4,
    avatar: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=6C63FF&color=fff'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <Navbar type="landing" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Teal Card */}
          <div className="bg-[#2BC0B4] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
            <div className="relative z-10">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                🌟 Alumni-Student Network
              </span>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Legacy of Excellence:<br />Uniting Alumni and<br />Students
              </h1>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Build meaningful connections, access mentorship, and unlock career opportunities through the power of your alumni network.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-xs text-white/80">Alumni</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-xs text-white/80">Students</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-white/80">Colleges</div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C'].map((l, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-white/40 border-2 border-white flex items-center justify-center text-xs font-bold">{l}</div>
                    ))}
                  </div>
                  <span className="text-xs text-white/80">Join 50K+ users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Auth Options */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Where Experience Meets Aspiration</h2>
            <p className="text-gray-500 text-sm mb-6">Connect with mentors, find opportunities, and accelerate your career.</p>

            <Link href="/home" className="block w-full text-center text-lg font-semibold text-[#2BC0B4] bg-[#e8faf9] hover:bg-[#2BC0B4] hover:text-white rounded-xl py-4 mb-6 transition-all">
              Explore the app!
            </Link>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-400">Continue with</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="#000" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.32.07 2.24.72 3.01.76 1.12-.23 2.19-.89 3.39-.78 1.44.15 2.52.72 3.22 1.85-2.9 1.76-2.21 5.63.4 6.72-.51 1.37-1.17 2.73-2.02 4.31zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
              <Link href="/signup" className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continue with Email
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2BC0B4] font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Interactive Sessions */}
      <section id="sessions" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Upcoming Interactive Sessions</h2>
            <p className="text-gray-500 text-sm mt-1">Don't miss these exclusive events for students and alumni</p>
          </div>
          <Link href="/home" className="text-[#2BC0B4] font-semibold text-sm hover:underline">View all →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="card hover:shadow-md transition-shadow group overflow-hidden p-0">
              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {event.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-2 line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <span>📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
                <Link href={`/events/${event.id}`} className="btn-primary text-xs w-full py-2">
                  Register Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Committed to Growing and Improving</h2>
            <p className="text-gray-500 mt-2">Our core values that guide every interaction on Bridgix</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#2BC0B4]/30 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-[#e8faf9] rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
                  {value.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1a2e] mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#1a1a2e]">What Our Community Says</h2>
          <p className="text-gray-500 mt-2">Real stories from students and alumni who transformed their careers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=700"
                alt="About Bridgix"
                className="w-full h-96 object-cover"
              />
            </div>
            <div>
              <span className="inline-block bg-[#e8faf9] text-[#2BC0B4] text-xs font-semibold px-3 py-1 rounded-full mb-4">About Us</span>
              <h2 className="text-3xl font-bold text-[#1a1a2e] mb-4">Building Bridges Between Generations</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-[#1a1a2e] mb-2 text-lg">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Bridgix was founded with a simple but powerful mission: to eliminate the disconnect between academic learning and professional reality. We believe every student deserves access to mentors who have walked the path before them, and every alumnus has wisdom worth sharing.
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                Our platform creates a vibrant ecosystem where knowledge flows freely, opportunities are discovered organically, and careers are shaped through genuine human connections. From technical interview prep to entrepreneurship guidance, Bridgix is where futures are built.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="btn-primary">Get Started Free</Link>
                <Link href="/register-college" className="btn-outline">Register Your College</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1a1a2e] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#2BC0B4] rounded-lg flex items-center justify-center">
                  <span className="font-bold">B</span>
                </div>
                <span className="text-lg font-bold">Bridgix</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting alumni and students for a brighter future together.
              </p>
              <div className="flex gap-3 mt-4">
                {['Twitter', 'LinkedIn', 'Instagram', 'GitHub'].map(s => (
                  <button key={s} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#2BC0B4] transition-colors text-xs">
                    {s[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#about" className="hover:text-[#2BC0B4]">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">Press</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-[#2BC0B4]">Documentation</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">API Reference</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#2BC0B4]">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">📧 <span>hello@bridgix.io</span></li>
                <li className="flex items-center gap-2">📞 <span>+91 98765 43210</span></li>
                <li className="flex items-center gap-2">📍 <span>New Delhi, India</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
            © 2026 Bridgix. All rights reserved. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
