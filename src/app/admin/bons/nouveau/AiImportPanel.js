"use client";

// Panneau "Assistant IA" de l'editeur de documents : texte/PDF/images ->
// brouillon analyse -> suggestions client -> application au formulaire.
// Extrait de page.js — JSX inchange, etat et handlers restent au parent.
import Image from "next/image";
import {
  AI_IMAGE_MAX_COUNT,
  AI_IMAGE_TYPES,
  AI_PDF_MAX_BYTES,
  AI_PDF_TYPES,
  aiImageSrc,
  aiImagesTotalSize,
  clearAiImagesSession,
  descriptionFromAiDraft,
  draftSectionsToWorkSections,
  formatBytes,
  formatTokenCount,
  formatUsdCost,
  resolveAiEmailDraft,
  saveAiImagesSession,
} from "./editor-utils";

export default function AiImportPanel({ editId, effectiveInvoiceMode, selectedClient, state, setters, actions, inputRefs }) {
  const {
    aiImportText, aiImportPdf, aiImportImages, aiDraft, aiDraftLoading, aiDraftApplying,
    aiDraftError, aiDraftMessage, aiDraftProgress, aiProgressPercent, hasAiImportSource,
    hasAiPdf, hasAiImages, aiClientSuggestions, aiClientSuggestionLoading, showAiClientSuggestionPanel,
  } = state;
  const {
    setAiImportText, setAiImportPdf, setAiImportImages, setAiDraft,
    setAiClientSuggestions, setAiClientLookupComplete, setAiImagePreviewIndex,
  } = setters;
  const {
    analyzeAiDocumentDraft, applyAiDocumentDraft, handleAiPaste,
    attachAiImportPdf, attachAiImportImages, selectAiClientSuggestion, createAiDraftClientAndSelect,
  } = actions;
  const { aiPdfInputRef, aiImageInputRef } = inputRefs;

  return (
        <div className="admin-card mb-5 max-w-[1500px] overflow-hidden rounded-xl border">
          <div className="border-b admin-border bg-cyan-500/10 px-4 py-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="admin-text text-sm font-black">
                  <i className="fas fa-wand-magic-sparkles mr-2 text-cyan-500"></i>
                  Assistant IA
                </h2>
                <p className="admin-text-muted mt-0.5 text-xs">
                  {effectiveInvoiceMode ? "Facture" : "Soumission"} a partir d&apos;un message client.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeAiDocumentDraft}
                disabled={aiDraftLoading || !hasAiImportSource}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-40"
              >
                <i className={`fas ${aiDraftLoading ? "fa-spinner fa-spin" : "fa-bolt"} mr-2`}></i>
                {aiDraftLoading ? "Analyse..." : "Analyser"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">
              <textarea
                value={aiImportText}
                onChange={(e) => setAiImportText(e.target.value)}
                onPaste={handleAiPaste}
                rows={8}
                className="admin-input min-h-36 w-full resize-y rounded-lg border px-3 py-2.5 text-sm"
                placeholder="Coller ici le texto, courriel ou notes brutes..."
              />

              <div className={`rounded-lg border p-3 ${
                hasAiPdf ? "border-cyan-400/50 bg-cyan-500/10" : "admin-border bg-white/[0.02]"
              }`}>
                <input
                  ref={aiPdfInputRef}
                  type="file"
                  accept={AI_PDF_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    attachAiImportPdf(e.target.files);
                    e.target.value = "";
                  }}
                />
                {hasAiPdf ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <i className="fas fa-file-pdf"></i>
                      </span>
                      <div className="min-w-0">
                        <p className="admin-text truncate text-sm font-bold">{aiImportPdf.name}</p>
                        <p className="admin-text-muted text-xs">PDF joint | {formatBytes(aiImportPdf.size)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => aiPdfInputRef.current?.click()}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600"
                      >
                        <i className="fas fa-rotate mr-2"></i>Remplacer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAiImportPdf(null);
                          setAiDraft(null);
                          setAiClientSuggestions([]);
                          setAiClientLookupComplete(false);
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10"
                      >
                        <i className="fas fa-times mr-2"></i>Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <i className="fas fa-file-pdf"></i>
                      </span>
                      <div>
                        <p className="admin-text text-sm font-bold">PDF a analyser</p>
                        <p className="admin-text-muted text-xs">PDF texte ou scanne, maximum {formatBytes(AI_PDF_MAX_BYTES)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => aiPdfInputRef.current?.click()}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-paperclip mr-2"></i>Ajouter PDF
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`rounded-lg border border-dashed p-3 transition-colors ${
                  hasAiImages ? "border-cyan-400/50 bg-cyan-500/10" : "admin-border bg-white/[0.02]"
                }`}
                onPaste={handleAiPaste}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer?.files || []);
                  const imageFiles = files.filter((item) => item.type?.startsWith("image/"));
                  const pdfFiles = files.filter((item) => (
                    item.type === "application/pdf" || String(item.name || "").toLowerCase().endsWith(".pdf")
                  ));
                  if (imageFiles.length > 0) attachAiImportImages(imageFiles);
                  if (pdfFiles.length > 0) attachAiImportPdf(pdfFiles);
                }}
              >
                <input
                  ref={aiImageInputRef}
                  type="file"
                  accept={AI_IMAGE_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) attachAiImportImages(files);
                    e.target.value = "";
                  }}
                />
                {hasAiImages ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="admin-text text-sm font-bold">{aiImportImages.length} image{aiImportImages.length > 1 ? "s" : ""} jointe{aiImportImages.length > 1 ? "s" : ""}</p>
                        <p className="admin-text-muted text-xs">{formatBytes(aiImagesTotalSize(aiImportImages))} au total</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => aiImageInputRef.current?.click()}
                        disabled={aiImportImages.length >= AI_IMAGE_MAX_COUNT}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600 disabled:opacity-40"
                      >
                        <i className="fas fa-plus mr-2"></i>Ajouter
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {aiImportImages.map((image, index) => {
                        const src = aiImageSrc(image);
                        return (
                          <div key={`${image.name}-${index}`} className="rounded-lg border admin-border bg-black/20 p-2">
                            <button
                              type="button"
                              onClick={() => setAiImagePreviewIndex(index)}
                              className="group relative mb-2 h-24 w-full overflow-hidden rounded-md ring-1 ring-cyan-400/25"
                              title="Voir l'image"
                            >
                              <Image
                                src={src}
                                alt=""
                                fill
                                sizes="160px"
                                unoptimized
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                {index + 1}
                              </span>
                              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                                <i className="fas fa-up-right-and-down-left-from-center"></i>
                              </span>
                            </button>
                            <p className="admin-text truncate text-xs font-bold">{image.name}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="admin-text-muted text-[11px]">{formatBytes(image.size)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = aiImportImages.filter((_, imageIndex) => imageIndex !== index);
                                  setAiImportImages(nextImages);
                                  setAiImagePreviewIndex(null);
                                  setAiDraft(null);
                                  if (nextImages.length > 0) {
                                    saveAiImagesSession(nextImages, editId);
                                  } else {
                                    clearAiImagesSession(editId);
                                    if (!editId) clearAiImagesSession();
                                  }
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-700 text-xs text-white hover:bg-slate-600"
                                title="Retirer"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                        <i className="fas fa-image"></i>
                      </span>
                      <div>
                        <p className="admin-text text-sm font-bold">Images</p>
                        <p className="admin-text-muted text-xs">Jusqu&apos;a {AI_IMAGE_MAX_COUNT} images PNG, JPG, WEBP ou GIF</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => aiImageInputRef.current?.click()}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-paperclip mr-2"></i>Ajouter
                    </button>
                  </div>
                )}
              </div>

              {(aiDraftLoading || aiProgressPercent > 0) && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="admin-text text-xs font-bold">
                      {aiDraftProgress.label || "Analyse IA en cours"}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-500">{aiProgressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/20">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${aiProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {aiDraft?.warnings?.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase text-amber-500">
                      A verifier
                    </p>
                    <span className="admin-text-muted text-[11px]">
                      {aiDraft.warnings.length} point{aiDraft.warnings.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {aiDraft.warnings.map((warning, index) => (
                      <div
                        key={`${warning}-${index}`}
                        className="min-w-0 rounded-md border border-amber-500/20 bg-black/10 px-3 py-2"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-500">
                            {index + 1}
                          </span>
                          <p className="admin-text min-w-0 break-words text-xs leading-snug">
                            {warning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border admin-border bg-white/[0.02] p-3">
              {!aiDraft ? (
                <div className="flex h-full min-h-44 flex-col justify-center text-center">
                  <i className="fas fa-file-invoice-dollar mb-3 text-2xl text-cyan-500/70"></i>
                  <p className="admin-text text-sm font-bold">Aucun brouillon analyse</p>
                  <p className="admin-text-muted mt-1 text-xs">Le resultat apparaitra ici avant d&apos;appliquer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="admin-text text-sm font-bold">{aiDraft.client?.name || "Client a verifier"}</p>
                      {aiDraft.client?.company && <p className="admin-text-muted text-xs">Compagnie: {aiDraft.client.company}</p>}
                      {aiDraft.client?.contactName && <p className="admin-text-muted text-xs">Contact: {aiDraft.client.contactName}</p>}
                      <p className="admin-text-muted text-xs">Client: {aiDraft.client?.email || "Email client a verifier"}</p>
                      <p className="admin-text-muted text-xs">Destinataire email: {resolveAiEmailDraft(aiDraft, selectedClient)?.to || "A verifier"}</p>
                      <p className="admin-text-muted text-xs">{aiDraft.client?.phone || ""}{aiDraft.client?.secondaryPhone ? ` | ${aiDraft.client.secondaryPhone}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      effectiveInvoiceMode ? "bg-orange-500/15 text-orange-500" : "bg-sky-500/15 text-sky-500"
                    }`}>
                      {effectiveInvoiceMode ? "Facture" : "Soumission"}
                    </span>
                  </div>

                  {showAiClientSuggestionPanel && (
                    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase text-sky-500">
                          Clients similaires
                        </p>
                        {aiClientSuggestionLoading && (
                          <span className="admin-text-muted inline-flex items-center gap-1 text-[10px]">
                            <i className="fas fa-spinner fa-spin"></i>Recherche
                          </span>
                        )}
                      </div>

                      {!aiClientSuggestionLoading && aiClientSuggestions.length === 0 && (
                        <p className="admin-text-muted mb-2 text-xs">
                          Aucun client proche trouve dans la base.
                        </p>
                      )}

                      {aiClientSuggestions.length > 0 && (
                        <div className="space-y-2">
                          {aiClientSuggestions.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => selectAiClientSuggestion(client)}
                              className="w-full rounded-md border border-sky-500/25 bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-sky-400 hover:bg-sky-500/15"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="admin-text truncate text-xs font-black">{client.name || "Client sans nom"}</p>
                                  {client.company && (
                                    <p className="admin-text-muted truncate text-[11px]">Compagnie: {client.company}</p>
                                  )}
                                  {client.contactName && (
                                    <p className="admin-text-muted truncate text-[11px]">Contact: {client.contactName}</p>
                                  )}
                                </div>
                                <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-500">
                                  {Math.round(client.matchScore || 0)}%
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] admin-text-muted">
                                {client.email && <span>{client.email}</span>}
                                {client.phone && <span>{client.phone}</span>}
                                {client.city && <span>{client.city}</span>}
                                {client._count?.workOrders ? <span>{client._count.workOrders} bon{client._count.workOrders > 1 ? "s" : ""}</span> : null}
                              </div>
                              {client.matchReasons?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {client.matchReasons.slice(0, 3).map((reason) => (
                                    <span key={reason} className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-500">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={createAiDraftClientAndSelect}
                        disabled={aiDraftApplying || aiClientSuggestionLoading}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/15 disabled:opacity-40"
                      >
                        <i className={`fas ${aiDraftApplying ? "fa-spinner fa-spin" : "fa-user-plus"} mr-2`}></i>
                        Creer un nouveau client avec cette analyse
                      </button>
                    </div>
                  )}

                  {aiDraft?.client && selectedClient && (
                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-emerald-600">Client selectionne</p>
                      <p className="admin-text mt-0.5 text-xs font-bold">{selectedClient.name}</p>
                      <p className="admin-text-muted text-[11px]">
                        {[selectedClient.company, selectedClient.email, selectedClient.phone].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                  )}

                  {aiDraft.analysisCost && (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-2"
                      title={`${formatTokenCount(aiDraft.analysisCost.inputTokens)} tokens entree | ${formatTokenCount(aiDraft.analysisCost.outputTokens)} tokens sortie`}
                    >
                      <span className="text-[10px] font-bold uppercase text-cyan-500">Cout analyse IA</span>
                      <span className="admin-text text-xs font-black">
                        {formatUsdCost(aiDraft.analysisCost.estimatedUsd)}
                      </span>
                    </div>
                  )}

                  <div className="rounded-lg border admin-border p-2">
                    <p className="admin-text-muted mb-1 text-[10px] font-bold uppercase">Description</p>
                    <p className="admin-text mb-3 whitespace-pre-wrap text-xs">
                      {descriptionFromAiDraft(aiDraft) || "Aucune description detectee."}
                    </p>
                    <p className="admin-text-muted mb-1 text-[10px] font-bold uppercase">Lignes</p>
                    <div className="space-y-1">
                      {draftSectionsToWorkSections(aiDraft.sections).slice(0, 3).map((section) => (
                        <div key={section.unitCode} className="rounded border admin-border bg-white/[0.02] px-2 py-1">
                          <p className="admin-text-muted text-[10px] font-bold uppercase">{section.unitCode}</p>
                          {section.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-start justify-between gap-2 text-xs">
                              <span className="admin-text min-w-0 break-words">{item.description}</span>
                              <span className="font-bold text-cyan-600">{Number(item.unitPrice || 0).toFixed(2)}$</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      {(aiDraft.items || []).slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-start justify-between gap-2 text-xs">
                          <span className="admin-text min-w-0 break-words">{item.description}</span>
                          <span className="font-bold text-cyan-600">{Number(item.unitPrice || 0).toFixed(2)}$</span>
                        </div>
                      ))}
                      {(aiDraft.items || []).length === 0 && draftSectionsToWorkSections(aiDraft.sections).length === 0 && (
                        <p className="admin-text-muted text-xs">Aucune ligne avec prix clair.</p>
                      )}
                    </div>
                  </div>

                  {aiDraft.email?.body && (
                    <details className="rounded-lg border admin-border p-2">
                      <summary className="cursor-pointer admin-text text-xs font-bold">Email propose</summary>
                      {resolveAiEmailDraft(aiDraft, selectedClient)?.to && (
                        <p className="mt-2 text-[10px] font-bold uppercase text-cyan-600">
                          Destinataire: {resolveAiEmailDraft(aiDraft, selectedClient).to}
                        </p>
                      )}
                      {resolveAiEmailDraft(aiDraft, selectedClient)?.subject && (
                        <p className="admin-text-muted mt-1 text-xs">
                          Sujet: {resolveAiEmailDraft(aiDraft, selectedClient).subject}
                        </p>
                      )}
                      <p className="admin-text-muted mt-2 whitespace-pre-wrap text-xs">{aiDraft.email.body}</p>
                    </details>
                  )}

                  <button
                    type="button"
                    onClick={applyAiDocumentDraft}
                    disabled={aiDraftApplying}
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-40"
                  >
                    <i className={`fas ${aiDraftApplying ? "fa-spinner fa-spin" : "fa-check"} mr-2`}></i>
                    {aiDraftApplying ? "Application..." : "Appliquer au formulaire"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {(aiDraftError || aiDraftMessage) && (
            <div className={`border-t px-4 py-3 text-sm ${
              aiDraftError ? "border-red-500/30 bg-red-500/10 text-red-500" : "admin-border bg-green-500/10 text-green-600"
            }`}>
              {aiDraftError || aiDraftMessage}
            </div>
          )}
        </div>
  );
}
