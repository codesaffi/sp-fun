import { Link } from "react-router-dom";

export default function JoinedCommunities({ communities }) {
  return <section><div className="tab-heading"><p className="eyebrow">YOUR COMMUNITIES</p><h2>Listen together</h2></div><div className="music-grid">{communities.length ? communities.map((community) => <article key={community._id}><div className="artwork">{community.icon?.startsWith("http") ? <img src={community.icon} alt="" /> : <span>{community.icon || "♫"}</span>}</div><h3>{community.name}</h3><p>{community.memberCount} members</p><Link className="text-button" to={`/communities/${community.slug}`}>Open community</Link></article>) : <div className="profile-empty"><span>♫</span><h2>No communities yet.</h2><p>Find listeners who share your sound.</p><Link to="/communities">Discover communities</Link></div>}</div></section>;
}
