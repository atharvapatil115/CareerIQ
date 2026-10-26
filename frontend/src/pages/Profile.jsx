import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";
import { apiUrl } from "../api";


async function getErrorMessage(response, fallback) {
    const data = await response.json().catch(() => null);

    return typeof data?.detail === "string"
        ? data.detail
        : fallback;
}

function Profile() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const response = await fetch(apiUrl("/users/me"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(
                        await getErrorMessage(
                            response,
                            "Could not load your profile."
                        )
                    );
                }

                const data = await response.json();

                if (!cancelled) {
                    setProfile(data);
                    setProfileForm({
                        name: data.name ?? "",
                        email: data.email ?? "",
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (token) {
            loadProfile();
        } else {
            setLoadError("Please log in again.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [token]);

    // Handle changes to profile fields.
    function handleProfileChange(event) {
        const { name, value } = event.target;

        setProfileForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // Save profile changes.
    async function handleProfileSubmit(event) {
        event.preventDefault();

        setSavingProfile(true);
        setProfileMessage("");
        setProfileError("");

        try {
            const response = await fetch(apiUrl("/users/me"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profileForm),
            });

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not update your profile."
                    )
                );
            }

            // Read the saved data if the endpoint returns it.
            const updatedProfile = await response.json().catch(() => null);

            setProfile((previous) => ({
                ...previous,
                ...profileForm,
                ...(updatedProfile ?? {}),
            }));

            setProfileMessage("Profile updated successfully.");
            setIsEditingProfile(false);
        } catch (err) {
            setProfileError(err.message);
        } finally {
            setSavingProfile(false);
        }
    }

    // Handle changes to password fields.
    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswordForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // Change the account password.
    async function handlePasswordSubmit(event) {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            const response = await fetch(
                apiUrl("/users/me/update_password"),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        current_password: passwordForm.current_password,
                        new_password: passwordForm.new_password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not change your password."
                    )
                );
            }

            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            setPasswordMessage("Password changed successfully.");
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setSavingPassword(false);
        }
    }

    // Delete the account after confirmation.
    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            "Delete your account permanently? This action cannot be undone."
        );

        if (!confirmed) return;

        setDeleting(true);
        setDeleteError("");

        try {
            const response = await fetch(apiUrl("/users/me"), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not delete your account."
                    )
                );
            }

            logout();
            navigate("/login", { replace: true });
        } catch (err) {
            setDeleteError(err.message);
            setDeleting(false);
        }
    }

    if (loading) {
        return <p>Loading your profile...</p>;
    }

    if (loadError) {
        return <p className="error-message">{loadError}</p>;
    }

    return (
        <div className="profile-page">
            <div className="profile-page-heading">
                <h1>My Profile</h1>
                <p>Manage your account and security settings.</p>
            </div>

            {/* Account overview */}
            
<section className="profile-card">
  <div className="profile-section-heading">
    <div>
      <h2>Personal Information</h2>
      <p className="profile-section-description">
        Manage your account details.
      </p>
    </div>

    {!isEditingProfile && (
      <button
        type="button"
        className="profile-primary-button"
        onClick={() => {
          setProfileForm({
            name: profile?.name ?? "",
            email: profile?.email ?? "",
          });
          setProfileError("");
          setProfileMessage("");
          setIsEditingProfile(true);
        }}
      >
        Edit Profile
      </button>
    )}
  </div>

  {profileMessage && (
    <p className="success-message">{profileMessage}</p>
  )}

  {profileError && (
    <p className="error-message">{profileError}</p>
  )}

  {!isEditingProfile ? (
    <div className="profile-details">
      <div className="profile-detail">
        <span>Full Name</span>
        <p>{profile?.name || "Not provided"}</p>
      </div>

      <div className="profile-detail">
        <span>Email Address</span>
        <p>{profile?.email || "Not provided"}</p>
      </div>
    </div>
  ) : (
    <form onSubmit={handleProfileSubmit}>
      <div className="profile-form-grid">
        <label>
          Full Name
          <input
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Email Address
          <input
            type="email"
            name="email"
            value={profileForm.email}
            onChange={handleProfileChange}
            required
          />
        </label>
      </div>

      <div className="profile-form-actions">
        <button
          type="submit"
          className="profile-primary-button"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="profile-secondary-button"
          disabled={savingProfile}
          onClick={() => {
            setProfileForm({
              name: profile?.name ?? "",
              email: profile?.email ?? "",
            });
            setProfileError("");
            setIsEditingProfile(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</section>

            {/* Change password */}
            <section className="profile-card">
                <h2>Security</h2>
                <p className="profile-section-description">
                    Change your password to keep your account secure.
                </p>

                {passwordMessage && (
                    <p className="success-message">{passwordMessage}</p>
                )}

                {passwordError && (
                    <p className="error-message">{passwordError}</p>
                )}

                <form onSubmit={handlePasswordSubmit}>
                    <div className="profile-form-grid">
                        <label className="profile-form-full">
                            Current Password
                            <input
                                type="password"
                                name="current_password"
                                value={passwordForm.current_password}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                required
                            />
                        </label>

                        <label>
                            New Password
                            <input
                                type="password"
                                name="new_password"
                                value={passwordForm.new_password}
                                onChange={handlePasswordChange}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <label>
                            Confirm New Password
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordForm.confirm_password}
                                onChange={handlePasswordChange}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="profile-primary-button"
                        disabled={savingPassword}
                    >
                        {savingPassword ? "Updating..." : "Change Password"}
                    </button>
                </form>
            </section>

            {/* Delete account */}
            <section className="profile-card danger-zone">
                <h2>Danger Zone</h2>
                <p>
                    Permanently delete your account. Your associated data may
                    also be deleted according to your backend's configuration.
                </p>

                {deleteError && (
                    <p className="error-message">{deleteError}</p>
                )}

                <button
                    type="button"
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : "Delete My Account"}
                </button>
            </section>
        </div>
    );
}

export default Profile;