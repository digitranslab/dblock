import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/contexts/authContext";
import { useContext, useState, useEffect, useRef } from "react";
import { api } from "@/controllers/API/api";

// Types
interface Secret {
  id: string;
  name: string;
  key: string;
  masked_value: string;
  category: string;
  profile: string;
  created_at: string;
}

interface ImportResult {
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
}

const CATEGORIES = ["AWS", "Azure", "GCP", "Database", "SSH", "Custom"];
const PROFILES = ["default", "development", "staging", "production"];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function SecretsPage(): JSX.Element {
  const { userData } = useContext(AuthContext);
  const isAdmin = userData?.is_superuser ?? false;

  // State
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [deletingSecret, setDeletingSecret] = useState<Secret | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formCategory, setFormCategory] = useState("Custom");
  const [formProfile, setFormProfile] = useState("default");

  // Decrypt state
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const decryptTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Import state
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch secrets
  const fetchSecrets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (profileFilter !== "all") params.append("profile", profileFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(`/api/v1/secrets/?${params.toString()}`);
      setSecrets(response.data);
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, [categoryFilter, profileFilter, searchQuery]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(decryptTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Create/Update secret
  const handleSaveSecret = async () => {
    try {
      const payload = {
        name: formName,
        key: formKey,
        value: formValue,
        category: formCategory,
        profile: formProfile,
      };

      if (editingSecret) {
        await api.put(`/api/v1/secrets/${editingSecret.id}`, payload);
      } else {
        await api.post("/api/v1/secrets/", payload);
      }

      setIsCreateModalOpen(false);
      resetForm();
      fetchSecrets();
    } catch (error: any) {
      console.error("Failed to save secret:", error);
      alert(error.response?.data?.detail || "Failed to save secret");
    }
  };

  // Delete secret
  const handleDeleteSecret = async () => {
    if (!deletingSecret) return;
    try {
      await api.delete(`/api/v1/secrets/${deletingSecret.id}`);
      setIsDeleteDialogOpen(false);
      setDeletingSecret(null);
      fetchSecrets();
    } catch (error: any) {
      console.error("Failed to delete secret:", error);
      alert(error.response?.data?.detail || "Failed to delete secret");
    }
  };

  // Decrypt secret
  const handleDecrypt = async (secret: Secret) => {
    try {
      const response = await api.post(`/api/v1/secrets/${secret.id}/decrypt`);
      const value = response.data.value;
      
      setDecryptedValues((prev) => ({ ...prev, [secret.id]: value }));

      // Auto-hide after 30 seconds
      if (decryptTimers.current[secret.id]) {
        clearTimeout(decryptTimers.current[secret.id]);
      }
      decryptTimers.current[secret.id] = setTimeout(() => {
        setDecryptedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[secret.id];
          return newValues;
        });
      }, 30000);
    } catch (error: any) {
      console.error("Failed to decrypt secret:", error);
      alert(error.response?.data?.detail || "Failed to decrypt secret");
    }
  };

  // Import YAML
  const handleImportYAML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/v1/secrets/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(response.data);
      fetchSecrets();
    } catch (error: any) {
      console.error("Failed to import YAML:", error);
      alert(error.response?.data?.detail || "Failed to import YAML");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormKey("");
    setFormValue("");
    setFormCategory("Custom");
    setFormProfile("default");
    setEditingSecret(null);
  };

  // Open edit modal
  const openEditModal = (secret: Secret) => {
    setEditingSecret(secret);
    setFormName(secret.name);
    setFormKey(secret.key);
    setFormValue(""); // Don't pre-fill value for security
    setFormCategory(secret.category);
    setFormProfile(secret.profile);
    setIsCreateModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ForwardedIconComponent name="Key" className="h-5 w-5" />
            Secrets Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your credentials and API keys securely
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept=".yaml,.yml"
                onChange={handleImportYAML}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ForwardedIconComponent name="Upload" className="mr-2 h-4 w-4" />
                Import YAML
              </Button>
              <Button size="sm" onClick={openCreateModal}>
                <ForwardedIconComponent name="Plus" className="mr-2 h-4 w-4" />
                Add Secret
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={fetchSecrets}>
            <ForwardedIconComponent name="RefreshCcw" className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <span className="text-green-600">Imported: {importResult.imported}</span>
              <span className="text-blue-600">Updated: {importResult.updated}</span>
              <span className="text-red-600">Failed: {importResult.failed}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setImportResult(null)}>
              <ForwardedIconComponent name="X" className="h-4 w-4" />
            </Button>
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              {importResult.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or key..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[250px]"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={profileFilter} onValueChange={setProfileFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Profile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Profiles</SelectItem>
            {PROFILES.map((prof) => (
              <SelectItem key={prof} value={prof}>{prof}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : secrets.length > 0 ? (
              secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-medium">{secret.name}</TableCell>
                  <TableCell className="font-mono text-sm">{secret.key}</TableCell>
                  <TableCell>{secret.category}</TableCell>
                  <TableCell>{secret.profile}</TableCell>
                  <TableCell className="font-mono">
                    {decryptedValues[secret.id] || secret.masked_value}
                  </TableCell>
                  <TableCell>{formatDate(secret.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isAdmin && !decryptedValues[secret.id] && (
                        <ShadTooltip content="Decrypt" side="top">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDecrypt(secret)}
                          >
                            <ForwardedIconComponent name="Eye" className="h-4 w-4" />
                          </Button>
                        </ShadTooltip>
                      )}
                      {isAdmin && (
                        <>
                          <ShadTooltip content="Edit" side="top">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(secret)}
                            >
                              <ForwardedIconComponent name="Pencil" className="h-4 w-4" />
                            </Button>
                          </ShadTooltip>
                          <ShadTooltip content="Delete" side="top">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingSecret(secret);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <ForwardedIconComponent
                                name="Trash2"
                                className="h-4 w-4 text-destructive"
                              />
                            </Button>
                          </ShadTooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No secrets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSecret ? "Edit Secret" : "Create Secret"}
            </DialogTitle>
            <DialogDescription>
              {editingSecret
                ? "Update the secret details. Leave value empty to keep existing."
                : "Add a new secret to your vault."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="My API Key"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="AWS_ACCESS_KEY_ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="password"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={editingSecret ? "(unchanged)" : "secret-value"}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Profile</Label>
                <Select value={formProfile} onValueChange={setFormProfile}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILES.map((prof) => (
                      <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSecret}>
              {editingSecret ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Secret</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingSecret?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSecret}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
