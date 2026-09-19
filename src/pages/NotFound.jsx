import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-center">
      <div className="not-found">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>That route doesn’t exist — let’s get you back on the map.</p>
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
