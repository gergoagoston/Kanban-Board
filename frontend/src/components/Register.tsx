import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import { useState } from "react";

export default function Login() {

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="w-25 p-3">
        <Form>
          <h1 className="text-center mb-4">Create an account!</h1>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              placeholder="Enter your username"
              // value={form.username}
              // onChange={updateField}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              // value={form.password}
              // onChange={updateField}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              // value={form.password}
              // onChange={updateField}
            />
          </Form.Group>
          <div className="text-center">
            <Button type="submit">Submit</Button>
          </div>
        </Form>
        <div className="mt-3 text-center">
          <p>You already a member?</p>
          <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}
