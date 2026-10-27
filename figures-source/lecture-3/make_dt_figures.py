"""Regenerate the decision-tree / ensemble figures for GRL lecture 3 in the GRL palette.

Usage: python make_dt_figures.py OUTDIR
"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import ListedColormap
from sklearn.ensemble import BaggingClassifier, RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, plot_tree

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

BLUE = "#00457c"
MUTED = "#5f625f"
RULE = "#d7d9d8"
CYAN = "#5ec8ec"
ORANGE = "#ff7900"
CLASS_COLORS = ["#ff7378", "#8b5cf6", "#f2c300", "#5ec8ec"]  # red, purple, yellow, cyan
CLASS_SOFT = ["#ffd5d7", "#ddd0fb", "#fbeeb0", "#cdeefa"]

plt.rcParams.update({
    "font.family": ["Liberation Sans"],
    "font.size": 11,
    "axes.edgecolor": MUTED,
    "axes.labelcolor": MUTED,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
    "savefig.transparent": False,
    "savefig.facecolor": "white",
})



def draw_tree_shape(model, ax, box_color="#ffc891", edge="#b35500"):
    """Draw only the structure of a fitted sklearn tree (no text), leaves spread evenly."""
    t = model.tree_
    pos = {}
    counter = [0]

    def walk(n, d):
        l, r = t.children_left[n], t.children_right[n]
        if l == -1:
            pos[n] = (counter[0], -d)
            counter[0] += 1
        else:
            walk(l, d + 1)
            walk(r, d + 1)
            pos[n] = ((pos[l][0] + pos[r][0]) / 2, -d)
    walk(0, 0)
    for n in pos:
        for c in (t.children_left[n], t.children_right[n]):
            if c != -1:
                ax.plot([pos[n][0], pos[c][0]], [pos[n][1], pos[c][1]], color=MUTED, linewidth=0.6, zorder=1)
    xs = np.array([p[0] for p in pos.values()])
    ys = np.array([p[1] for p in pos.values()])
    ax.scatter(xs, ys, marker="s", s=max(6, 400 / max(counter[0], 1)), color=box_color, edgecolor=edge, linewidth=0.6, zorder=2)
    ax.set_axis_off()


def save(fig, name):
    fig.savefig(OUT / name)
    plt.close(fig)
    print("wrote", name)


# ---------------------------------------------------------------------------
# Part 1: sunflower happiness vs temperature (regression trees, overfitting)
# ---------------------------------------------------------------------------
def happiness(t):
    return ((t > 10) & (t <= 22)).astype(float)


def sample_sunflowers(n, seed):
    r = np.random.default_rng(seed)
    t = np.sort(r.uniform(0, 30, n))
    y = happiness(t) + r.normal(0, 0.2, n)
    return t, y


t_tr, y_tr = sample_sunflowers(75, 1)
t_te, y_te = sample_sunflowers(75, 2)
grid = np.linspace(0, 30, 1500)[:, None]


def regression_panel(ax, model, title):
    ax.scatter(t_tr, y_tr, s=22, color=CYAN, edgecolor=BLUE, linewidth=0.5, label="training data", zorder=3)
    ax.scatter(t_te, y_te, s=22, color=ORANGE, edgecolor="#b35500", linewidth=0.5, label="test data", zorder=3)
    ax.plot(grid[:, 0], model.predict(grid), color=BLUE, linewidth=2, label="regression tree", zorder=4)
    ax.set_xlabel("temperature X [°C]")
    ax.set_ylabel("sunflower happiness y")
    ax.set_xlim(0, 30)
    ax.set_title(title, color=BLUE, fontsize=12, fontweight="bold")
    ax.legend(frameon=False, fontsize=9, loc="upper right")


def mse(model):
    return float(np.mean((model.predict(t_te[:, None]) - y_te) ** 2))


full = DecisionTreeRegressor(random_state=0).fit(t_tr[:, None], y_tr)
fig, ax = plt.subplots(figsize=(6.4, 3.4))
regression_panel(ax, full, f"no regularization — test MSE {mse(full):.3f}")
save(fig, "dt_overfit_full.png")

fig, ax = plt.subplots(figsize=(9, 3.2))
draw_tree_shape(full, ax)
save(fig, "dt_overfit_full_tree.png")

shallow = DecisionTreeRegressor(max_depth=3, random_state=0).fit(t_tr[:, None], y_tr)
fig, ax = plt.subplots(figsize=(6.4, 3.4))
regression_panel(ax, shallow, f"max_depth = 3 — test MSE {mse(shallow):.3f}")
save(fig, "dt_depth3_fit.png")

fig, ax = plt.subplots(figsize=(8, 3.4))
art = plot_tree(shallow, ax=ax, filled=True, feature_names=["temperature"], precision=2,
                impurity=True, fontsize=8, rounded=True)
for a in art:
    if a.get_bbox_patch() is not None: a.get_bbox_patch().set_edgecolor(BLUE)
save(fig, "dt_depth3_tree.png")

with open(OUT / "dt_mse_values.txt", "w") as fh:
    fh.write(f"full tree test MSE {mse(full):.4f} leaves {full.get_n_leaves()}\n")
    fh.write(f"depth3 test MSE {mse(shallow):.4f}\n")

# cost-complexity pruning: three alphas
fig, axes = plt.subplots(1, 3, figsize=(13, 3.6))
for ax, alpha in zip(axes, [0.0001, 0.001, 0.003]):
    m = DecisionTreeRegressor(random_state=0, ccp_alpha=alpha).fit(t_tr[:, None], y_tr)
    tr = float(np.mean((m.predict(t_tr[:, None]) - y_tr) ** 2))
    draw_tree_shape(m, ax)
    ax.set_title(f"α = {alpha}\n{m.get_n_leaves()} leaves · train MSE {tr:.3f} · test MSE {mse(m):.3f}",
                 fontsize=11, color=BLUE)
save(fig, "dt_ccp_alphas.png")

# ---------------------------------------------------------------------------
# Part 2: four-class synthetic dataset
# ---------------------------------------------------------------------------
MEANS = np.array([[-2.0, 7.5], [1.0, 4.5], [-2.5, 2.5], [2.0, 1.0]])
COVS = [1.3 * np.array([[1.6, 0.3], [0.3, 1.0]]), 1.3 * np.array([[1.4, -0.2], [-0.2, 0.8]]),
        1.3 * np.array([[1.5, 0.2], [0.2, 1.0]]), 1.3 * np.array([[1.3, -0.3], [-0.3, 1.0]])]
XLIM, YLIM = (-6, 6), (-3, 11)


def sample_classes(n_per, seed):
    r = np.random.default_rng(seed)
    X = np.vstack([r.multivariate_normal(m, c, n_per) for m, c in zip(MEANS, COVS)])
    y = np.repeat(np.arange(4), n_per)
    return X, y


xx, yy = np.meshgrid(np.linspace(*XLIM, 500), np.linspace(*YLIM, 500))
G = np.c_[xx.ravel(), yy.ravel()]


def style_ax(ax, title=None):
    ax.set_xlim(*XLIM)
    ax.set_ylim(*YLIM)
    ax.set_xlabel("feature 1  $x_1$")
    ax.set_ylabel("feature 2  $x_2$")
    ax.set_xticks([])
    ax.set_yticks([])
    if title:
        ax.set_title(title, color=BLUE, fontsize=13)


def scatter(ax, X, y, s=12):
    for k in range(4):
        ax.scatter(*X[y == k].T, s=s, color=CLASS_COLORS[k], edgecolor="white", linewidth=0.3, zorder=3)


def boundary(ax, model, alpha=0.9):
    Z = model.predict(G).reshape(xx.shape)
    ax.contourf(xx, yy, Z, levels=[-0.5, 0.5, 1.5, 2.5, 3.5], colors=CLASS_SOFT, alpha=alpha, zorder=0)


def density_contours(ax):
    from scipy.stats import multivariate_normal
    for m, c, col in zip(MEANS, COVS, CLASS_COLORS):
        Z = multivariate_normal(m, c).pdf(G).reshape(xx.shape)
        ax.contourf(xx, yy, Z, levels=np.linspace(Z.max() * 0.08, Z.max(), 5), colors=[col], alpha=0.13, zorder=0)
        ax.contour(xx, yy, Z, levels=np.linspace(Z.max() * 0.08, Z.max(), 5), colors=[col], linewidths=0.6, alpha=0.5)


X1, y1 = sample_classes(70, 11)
X2, y2 = sample_classes(70, 12)

fig, ax = plt.subplots(figsize=(5.2, 4.4))
density_contours(ax)
style_ax(ax)
save(fig, "dt_cls_distribution.png")

fig, ax = plt.subplots(figsize=(5.2, 4.4))
density_contours(ax)
scatter(ax, X1, y1)
style_ax(ax)
save(fig, "dt_cls_sample.png")

dt1 = DecisionTreeClassifier(random_state=0).fit(X1, y1)
dt2 = DecisionTreeClassifier(random_state=0).fit(X2, y2)

fig, ax = plt.subplots(figsize=(5.2, 4.4))
boundary(ax, dt1)
scatter(ax, X1, y1)
style_ax(ax)
save(fig, "dt_cls_tree.png")

fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
for ax, (X, y, m, name) in zip(axes, [(X1, y1, dt1, r"$\mathcal{D}_1 \rightarrow DT_1$"),
                                      (X2, y2, dt2, r"$\mathcal{D}_2 \rightarrow DT_2$")]):
    boundary(ax, m)
    scatter(ax, X, y)
    style_ax(ax, name)
save(fig, "dt_cls_two_samples.png")

bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=200, random_state=0).fit(X1, y1)
rf = RandomForestClassifier(n_estimators=200, random_state=0).fit(X1, y1)


def soft_boundary(ax, model):
    P = model.predict_proba(G)
    rgb = np.array([matplotlib.colors.to_rgb(c) for c in CLASS_SOFT])
    img = (P @ rgb).reshape(*xx.shape, 3)
    ax.imshow(img, extent=(*XLIM, *YLIM), origin="lower", aspect="auto", zorder=0)


fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
boundary(axes[0], dt1)
scatter(axes[0], X1, y1)
style_ax(axes[0], "single decision tree")
soft_boundary(axes[1], bag)
scatter(axes[1], X1, y1)
style_ax(axes[1], "bag of 200 decision trees")
save(fig, "dt_bagging_vs_tree.png")

# variable importance: two informative features + four noise features
r = np.random.default_rng(5)
Xn = np.hstack([X1, r.normal(size=(len(X1), 4))])
names = ["$x_1$", "$x_2$", "noise $x_3$", "noise $x_4$", "noise $x_5$", "noise $x_6$"]
rfi = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xn, y1)
imp = rfi.feature_importances_ / rfi.feature_importances_.max() * 100
order = np.argsort(imp)
fig, ax = plt.subplots(figsize=(4.6, 3.0))
ax.barh(np.array(names)[order], imp[order], color=[BLUE if i < 2 else "#b9dcf0" for i in order])
ax.set_xlabel("variable importance (mean decrease in impurity, %)")
save(fig, "dt_rf_importance.png")
