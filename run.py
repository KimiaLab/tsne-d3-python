from sklearn.datasets import fetch_mldata
from sklearn.manifold import TSNE
from skimage.io import imsave
import numpy as np
from matplotlib import cm
import matplotlib
import pandas as pd
import argparse


def get_colors(n):
    cmap = cm.get_cmap('seismic', n)
    return np.array(
        [matplotlib.colors.rgb2hex(cmap(i)[:3]) for i in range(cmap.N)])


def read_input_csv(file_path, has_header, has_target):

    if has_header:
        df = pd.read_csv(file_path, header=0)
    else:
        df = pd.read_csv(file_path, header=None)

    if has_target:
        initial_columns = ['image', 'target']
    else:
        initial_columns = ['image']

    data = np.array(df.iloc[:, len(initial_columns):])

    df = df.iloc[:, :len(initial_columns)]
    df.columns = initial_columns
    df['data'] = [list(d) for d in data]

    return df


def calculate_tsne(data):

    tsne = TSNE(n_components=2, verbose=1)
    return tsne.fit_transform(data)


def get_args():
    # parse arguments
    parser = argparse.ArgumentParser(description='T-SNE Data visualizer')
    parser.add_argument('input_data', type=str, help='Path to CSV data file')
    parser.add_argument(
        '--max_num_points',
        type=int,
        default=1000,
        help='Max number of data to consider')
    parser.add_argument(
        '--targets',
        dest='has_target',
        action='store_true',
        help='CSV data file contains target information')
    parser.add_argument(
        '-s',
        '--server',
        dest='is_server',
        action='store_true',
        help='Start a server')
    parser.add_argument(
        '--header',
        dest='has_header',
        action='store_true',
        help='Flag indicating CSV data file contains header info')
    return parser.parse_args()


def write_csv(path, color, image_name, x, y):

    df = pd.DataFrame({'color': []})
    df['color'] = color
    df['image_name'] = image_name
    df['x'] = x
    df['y'] = y

    df.to_csv(path, index=False)


def start_server():
    from http import server
    import socketserver
    import os

    web_dir = os.path.join(os.path.dirname(__file__), 'web')
    os.chdir(web_dir)

    port = 8000
    Handler = server.SimpleHTTPRequestHandler

    httpd = socketserver.TCPServer(("", port), Handler)

    print("serving at port", port)
    httpd.serve_forever()


def main():

    args = get_args()
    df = read_input_csv(args.input_data, args.has_header, args.has_target)

    # TODO: do using targets???
    # apply the permutations
    df.apply(np.random.permutation)
    df = df[:args.max_num_points]

    rdata = calculate_tsne(np.array(df.data.tolist()))
    x = rdata[:, 0]
    y = rdata[:, 1]

    if not args.has_target:
        colors = ["red"] * len(df)
    else:
        colors = get_colors(len(np.unique(
            df.target.tolist())))[df.target.tolist()]

    write_csv('web/data.csv', colors, df.image.tolist(), x, y)

    if args.is_server:
        start_server()


main()
