import { Link } from 'react-router-dom';
import { Trophy, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-app-card border-t border-app-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Branding & About */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-gold" />
            <span className="text-xl font-black tracking-tighter text-app-text uppercase">NDEJJE <span className="text-sky-blue">SPORTS</span></span>
          </Link>
          <p className="text-app-text/50 text-sm leading-relaxed">
            The official sports data management platform for Ndejje school clubs. Tracking performance and celebrating champions since 2025.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-app-text/40 hover:text-gold transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-app-text/40 hover:text-gold transition-colors"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-app-text/40 hover:text-gold transition-colors"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-app-text font-bold uppercase tracking-widest text-sm mb-6">Navigation</h3>
          <ul className="space-y-4">
            <li><Link to="/" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Home</Link></li>
            <li><Link to="/#fixtures" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Fixtures</Link></li>
            <li><Link to="/#leaderboard" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Results</Link></li>
            <li><Link to="/#leaderboard" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Leaderboard</Link></li>
            <li><Link to="/about" className="text-app-text/40 hover:text-app-text transition-colors text-sm">About</Link></li>
          </ul>
        </div>

        {/* Sports */}
        <div>
          <h3 className="text-app-text font-bold uppercase tracking-widest text-sm mb-6">Sports</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Football</a></li>
            <li><a href="#" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Basketball</a></li>
            <li><a href="#" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Netball</a></li>
            <li><a href="#" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Cricket</a></li>
            <li><a href="#" className="text-app-text/40 hover:text-app-text transition-colors text-sm">Volleyball</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-app-text font-bold uppercase tracking-widest text-sm mb-6">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 text-app-text/50 text-sm">
              <Mail className="h-4 w-4 text-sky-blue" />
              <span>info@ndejjesports.com</span>
            </li>
            <li className="flex items-center space-x-3 text-app-text/50 text-sm">
              <Phone className="h-4 w-4 text-sky-blue" />
              <span>+256 123 456 789</span>
            </li>
            <li className="flex items-center space-x-3 text-app-text/50 text-sm">
              <MapPin className="h-4 w-4 text-sky-blue" />
              <span>Ndejje, Uganda</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-app-border text-center">
        <p className="text-app-text/30 text-xs uppercase tracking-widest font-medium">
          © ICT CLUB NDEJJE 2025–2026. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
